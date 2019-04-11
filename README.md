# Cash Money

A library for formatting currency based on currency code aswell as language codes. This library is designed to be small and fast but it sacrifices on initialization time and data readability. Therefore it is best practise to initialize the currency library as early as possible.


## Installation

```shell
npm i cash-money
```

## Usage

```javascript
import CashMoney, {CashMoneyData} from 'cash-money'

// fill library with data
const formatter = new CashMoney(CashMoneyData)

// set the language and currency codes
let options = formatter.setup("de-DE","EUR")

// localize a value - number, showSymbol, show '.00'
let localizedAmount = formatter.localize(1234.0001,true,true)

console.log(localizedAmount) // €1.234,00
```