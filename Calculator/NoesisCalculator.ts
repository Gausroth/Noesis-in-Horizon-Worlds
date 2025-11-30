import { Component } from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';
class NoesisCalculator extends Component<typeof NoesisCalculator> {

    private dataContext = {
        ClearButtonEvent: () => this.ClearButton(),
        ZeroButtonEvent: () => this.NumberButton(0),
        OneButtonEvent: () => this.NumberButton(1),
        TwoButtonEvent: () => this.NumberButton(2),
        ThreeButtonEvent: () => this.NumberButton(3),
        FourButtonEvent: () => this.NumberButton(4),
        FiveButtonEvent: () => this.NumberButton(5),
        SixButtonEvent: () => this.NumberButton(6),
        SevenButtonEvent: () => this.NumberButton(7),
        EightButtonEvent: () => this.NumberButton(8),
        NineButtonEvent: () => this.NumberButton(9),
        DivisionButtonEvent: () => this.SymbolButton("/"),
        MultiplicationButtonEvent: () => this.SymbolButton("*"),
        SubtractionButtonEvent: () => this.SymbolButton("-"),
        AdditionButtonEvent: () => this.SymbolButton("+"),
        EqualsButtonEvent: () => this.EqualsButton(),
        DecimalButtonEvent: () => this.SymbolButton("."),
        Text: "0"
    }

    start() {
        this.entity.as(NoesisGizmo).dataContext = this.dataContext;
        this.ClearButton();
    }

    ClearButton() {
        this.dataContext.Text = "0";
    }

    NumberButton(number: number) {
        let s = this.dataContext.Text;

        if (s === "0") s = "";

        s += number.toString();

        this.dataContext.Text = s;
    }

    SymbolButton(symbol: string) {
        let s = this.dataContext.Text;

        if (s === "") return;

        if (s[s.length - 1] === "." || s[s.length - 1] === "+" || s[s.length - 1] === "-" || s[s.length - 1] === "*" || s[s.length - 1] === "/") return;

        s += symbol;

        this.dataContext.Text = s;
    }

    EqualsButton() {
        let s = this.dataContext.Text;

        if (s === "0" || s === "") return;

        const numbers = s.split(/[\+\-\*/]/).map(Number);

        const symbols = s.split("").filter(c => "+-*/".includes(c));

        while (symbols.includes("*")) {
            const index = symbols.indexOf("*");
            const result = numbers[index] * numbers[index + 1];
            numbers.splice(index, 2, result);
            symbols.splice(index, 1);
        }

        while (symbols.includes("/")) {
            const index = symbols.indexOf("/");

            if (numbers[index] === 0 || numbers[index + 1] === 0) {
                this.dataContext.Text = "Error";
                return;
            }

            const result = numbers[index] / numbers[index + 1];
            numbers.splice(index, 2, result);
            symbols.splice(index, 1);
        }

        while (symbols.includes("+")) {
            const index = symbols.indexOf("+");
            const result = numbers[index] + numbers[index + 1];
            numbers.splice(index, 2, result);
            symbols.splice(index, 1);
        }

        while (symbols.includes("-")) {
            const index = symbols.indexOf("-");
            const result = numbers[index] - numbers[index + 1];
            numbers.splice(index, 2, result);
            symbols.splice(index, 1);
        }

        this.dataContext.Text = numbers[0].toString();
    }
}

Component.register(NoesisCalculator);
