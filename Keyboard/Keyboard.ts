import { Component, PropTypes, TextGizmo } from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';

/*
Noesis Keyboard � 2025 by GausRoth is licensed under Creative Commons Attribution 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by/4.0/
*/
class Keyboard extends Component<typeof Keyboard> {
    static propsDefinition = {
        textGizmo: { type: PropTypes.Entity }
    };

    private isShift: boolean = false;
    private isCapsLock: boolean = false;
    private isR: boolean = false;
    private isG: boolean = false;
    private isB: boolean = false;

    private string = "";
    private rString = "";
    private gString = "";
    private bString = "";

    private dataContext = {
        KeyPressed: (value: unknown) => this.KeyPressed(value as string),
        R: "R: 255",
        G: "G: 255",
        B: "B: 255",
        FontColor: "#FFFFFFFF",
        RowThreeButtonOneButtonColor: "#FF000000",
        RowFourButtonOneButtonColor: "#FF000000",
        RowFourButtonTwelveButtonColor: "#FF000000",
        RButtonColor: "#FF000000",
        GButtonColor: "#FF000000",
        BButtonColor: "#FF000000",
    }

    start() {
        this.entity.as(NoesisGizmo).dataContext = this.dataContext;
    }

    KeyPressed(value: string) {
        console.log("Key Pressed: " + value);
        if (value === "BACKSPACE") {
            this.BackspacePressed();
            return;
        }
        else if (value === "ENTER") {
            this.EnterPressed();
            return;
        }
        else if (value === "SPACE") {
            this.SpacePressed();
            return;
        }
        else if (value === "SHIFT") {
            this.ToggleShift();
            return;
        }
        else if (value === "CAPS LOCK") {
            this.ToggleCapsLock();
            return;
        }
        else if (value === "RCOLOR") {
            this.ToggleRed();
            return;
        }
        else if (value === "GCOLOR") {
            this.ToggleGreen();
            return;
        }
        else if (value === "BCOLOR") {
            this.ToggleBlue();
            return;
        }

        let key = value.toLowerCase();
        if (this.isShift || this.isCapsLock) {
            if (key.length === 1) key = key.toUpperCase();
            else key = key.charAt(1)
        }
        else if (key.length > 1) key = key.charAt(0)
        console.log(key)
        if (this.isR || this.isG || this.isB) {
            if (key === "0" || key === "1" || key === "2" || key === "3" || key === "4" || key === "5" || key === "6" || key === "7" || key === "8" || key === "9") {
                if (this.isR) {
                    this.rString += key;
                    this.dataContext.R = "R: " + Math.min(parseInt(this.rString), 255);
                }
                if (this.isG) {
                    this.gString += key;
                    this.dataContext.G = "G: " + Math.min(parseInt(this.gString), 255);
                }
                if (this.isB) {
                    this.bString += key;
                    this.dataContext.B = "B: " + Math.min(parseInt(this.bString), 255);
                }
                const r = parseInt(this.dataContext.R.toString().split(": ")[1]);
                const g = parseInt(this.dataContext.G.toString().split(": ")[1]);
                const b = parseInt(this.dataContext.B.toString().split(": ")[1]);
                const hex = this.rgbToHex(r, g, b);
                this.dataContext.FontColor = hex.toUpperCase();
            }
            else if (this.isR) this.ToggleRed();
            else if (this.isG) this.ToggleGreen();
            else if (this.isB) this.ToggleBlue();
        }
        else {
            this.string += key;
            this.SetTextGizmoText(this.string);
        }
    }

    BackspacePressed() {
        this.string = this.string.slice(0, -1);
        this.SetTextGizmoText(this.string);
    }

    EnterPressed() {
        this.string += "<br>";
        this.SetTextGizmoText(this.string);
    }

    SpacePressed() {
        this.string += " ";
        this.SetTextGizmoText(this.string);
    }

    SetTextGizmoText(text: string) {
        if (!this.props.textGizmo) {
            console.warn("TextGizmo is missing or null.");
            return;
        }
        this.props.textGizmo.as(TextGizmo).text.set(text);
    }

    ToggleShift() {
        this.isShift = !this.isShift
        if (this.isShift) {
            this.dataContext.RowFourButtonOneButtonColor = "#FF323232";
            this.dataContext.RowFourButtonTwelveButtonColor = "#FF323232";
        }
        else {
            this.dataContext.RowFourButtonOneButtonColor = "#FF000000";
            this.dataContext.RowFourButtonTwelveButtonColor = "#FF000000";
        }
    }

    ToggleCapsLock() {
        this.isCapsLock = !this.isCapsLock
        if (this.isCapsLock) this.dataContext.RowThreeButtonOneButtonColor = "#FF323232";
        else this.dataContext.RowThreeButtonOneButtonColor = "#FF000000";
    }

    ToggleRed() {
        this.isR = !this.isR;
        if (this.isR) {
            this.dataContext.RButtonColor = "#FF323232";
            this.dataContext.GButtonColor = "#FF000000";
            this.dataContext.BButtonColor = "#FF000000";
        }
        else this.dataContext.RButtonColor = "#FF000000";
        this.isG = false;
        this.isB = false;
        this.rString = ""
    }

    ToggleGreen() {
        this.isG = !this.isG;
        if (this.isG) {
            this.dataContext.RButtonColor = "#FF000000";
            this.dataContext.GButtonColor = "#FF323232";
            this.dataContext.BButtonColor = "#FF000000";
        }
        else this.dataContext.GButtonColor = "#FF000000";
        this.isR = false;
        this.isB = false;
        this.gString = ""
    }

    ToggleBlue() {
        this.isB = !this.isB;
        if (this.isB) {
            this.dataContext.RButtonColor = "#FF000000";
            this.dataContext.GButtonColor = "#FF000000";
            this.dataContext.BButtonColor = "#FF323232";
        }
        else this.dataContext.BButtonColor = "#FF000000";
        this.isG = false;
        this.isR = false;
        this.bString = ""
    }

    ComponentToHex(c: number) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r: number, g: number, b: number) {
        return "#FF" + this.ComponentToHex(r) + this.ComponentToHex(g) + this.ComponentToHex(b);
    }
}

Component.register(Keyboard);
