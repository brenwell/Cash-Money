import PriceTagData from "./data";

/**
 * Currency & number formatting helper
 *
 * @example
 *
 * const formatter = new PriceTag(PriceTagData)
 * const options = formatter.setup("de-DE","EUR")
 * const formattedStr = formatter.localize(1234.56,true,true)
 */
export default class PriceTag
{
    /**
     * @typedef {Object} Options
     * @property {string} format - The format, e.g. `%s%v` is €10
     * @property {string} decimal - The decimal delimiter
     * @property {string} thousand - The thousand delimiter
     * @property {string} symbol - The currency symbol
     */

    /**
     * @param {object} data - currency data
     * @param {object} data.defaults - the most common currency formatting
     * @param {object} data.locales - the locale fallback
     * @param {object} data.currencies - the alternative formatting
     * @returns {PriceTag} for chaining
     */
    constructor(data = PriceTagData)
    {
        this.defaults = data.defaults
        this.locales = data.locales
        this.currencies = data.currencies

        return this
    }

    /**
     * @param {string} locale - localeCode e.g. de-AT
     * @param {string} currency - currencyCode e.g. EUR
     * @returns {Options} the determined options
     */
    setup(locale, currency)
    {
        if (!currency || (currency === ``))
        {
            throw new Error(`No currency code provided`)
        }

        if (!locale || (locale === ``))
        {
            throw new Error(`No locale code provided`)
        }

        const cc = currency.toUpperCase()
        let lc = locale

        // if de-DE or hu-HU make de or hu
        const parts = lc.toLowerCase().split(`-`)

        if (parts[1] && (parts[0] === parts[1]))
        {
            lc = parts[0]
        }

        let format
        let decimal
        let thousand
        let symbol

        // get the symbol
        symbol = this._lookFor(this.currencies.s, cc)

        // attempt to get formatting data for locale
        format = this._lookFor(this.locales.f, lc)
        decimal = this._lookFor(this.locales.d, lc)
        thousand = this._lookFor(this.locales.t, lc)

        // fallback to defaults if we have no data
        if (!format)
        {
            (
                {
                    format,
                } = this.defaults)
        }

        if (!decimal)
        {
            (
                {
                    decimal,
                } = this.defaults)
        }

        if (!thousand)
        {
            (
                {
                    thousand,
                } = this.defaults)
        }

        // if no symbol use currency code
        if (!symbol)
        {
            symbol = cc
            // if no format aswell use a different format
            format = this.defaults.noSymbolFormat
        }

        thousand = this.nbspToSpace(thousand)
        decimal = this.nbspToSpace(decimal)

        this.options = {
            format,
            decimal,
            thousand,
            symbol,
        }

        return this.options
    }

    /**
     * Method that seaches throw data looking for matches
     *
     * @private
     * @param {array} data - data to search through
     * @param {string} query - item we are looking for
     * @return {object} What we found
     */
    _lookFor(data, query)
    {
        for (const key in data)
        {
            const val = data[key]

            for (let i = 0, len = val.length; i < len; i++)
            {
                if (val[i] === query)
                {
                    return key
                }
            }
        }

        return null
    }

    /**
     * Determines if not numeric.
     *
     * @param  {Any}   n  { parameter_description }
     * @return {Boolean}  True if not numeric, False otherwise.
     */
    isNotNumeric(n)
    {
        return !(!isNaN(parseFloat(n)) && isFinite(n))
    }

    /**
     * @return {string} The current currency symbol
     */
    getCurrencySymbol()
    {
        return this.options.symbol
    }

    /**
     * @param {number} amount - amount to format
     * @param {boolean} [showSymbol] - Should include symbol in formatting
     * @param {boolean} [show00] - should show `00` e.g. €13.00 = €13 but €12.10 = €12.10
     * @return {string} The localized representation of the given amount
     */
    localize(amount, showSymbol, show00)
    {
        if (amount === ``)
        {
            return ``;
        }

        amount = parseFloat(amount)

        if (this.isNotNumeric(amount))
        {
            console.error('Amount is not valid: ', amount); // eslint-disable-line

            return ``;
        }

        if (show00 === undefined)
        {
            show00 = true
        }

        amount = this.roundToDecimal(amount)
        const precision = this.getPrecision(amount, show00)
        const value = this.formatNumber(amount, precision, this.options)

        if (showSymbol === undefined)
        {
            showSymbol = true
        }

        if (!showSymbol)
        {
            return value
        }

        let result = this.options.format

        result = result.replace(`%s`, this.options.symbol)
        result = result.replace(`%v`, value)

        return result
    }

    /**
     * @param {number} amount - amount to format
     * @param {number} precision - number of decimal places
     * @param {object} options - formatter options
     * @return {string} The localized representation of the given amount with no symbol
     */
    formatNumber(amount, precision, options)
    {
        const usePrecision = precision
        const negative = amount < 0 ? `-` : ``;
        const base = String(parseInt(Math.abs(amount || 0).toFixed(usePrecision), 10))
        const mod = base.length > 3 ? base.length % 3 : 0

        return negative + (mod ? base.substr(0, mod) + options.thousand : ``)
        + base.substr(mod).replace(/(\d{3})(?=\d)/g, `$1${options.thousand}`)
        + (usePrecision ? options.decimal + Math.abs(amount).toFixed(usePrecision).split(`.`)[1] : ``)
    }

    /**
     * @private
     * @param {number} amount - amount to format
     * @param {boolean} show00 - should show `00` e.g. €13.00 = €13 but €12.10 = €12.10
     * @return {string} The localized representation of the given amount with no symbol
     */
    getPrecision(amount, show00)
    {
        if (show00)
        {
            return 2
        }

        if ((amount % 1) !== 0)
        {
            return 2
        }

        return 0
    }

    /**
     * @private
     * @param {number} amount - amount to format
     * @return {number} Converts 10.967 = 10.97
     */
    roundToDecimal(amount)
    {
        return Math.round(amount * 100) / 100
    }

    /**
     * @private
     * @param {number} char - character to test
     * @return {number} Returns a whitespace char in place of a nbsp
     */
    nbspToSpace(char)
    {
        if (char.charCodeAt(0) === 160)
        {
            char = String.fromCharCode(32)
        }

        return char
    }
}