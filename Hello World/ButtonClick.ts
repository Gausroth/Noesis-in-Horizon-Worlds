import {Component} from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';
class ButtonClick extends Component<typeof ButtonClick> {

    private dataContext = {
        ButtonClickEvent: () => this.ButtonClicked(),
        Textbox: "Hello World"
    }

    start() {
        this.entity.as(NoesisGizmo).dataContext = this.dataContext;
    }

    ButtonClicked() {
        this.dataContext.Textbox = "Button Clicked!";
    }
}
Component.register(ButtonClick);
