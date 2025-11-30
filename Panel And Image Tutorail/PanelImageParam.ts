import { Component, TextureAsset, Player } from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';
import { ImageSource } from 'horizon/ui';

class PanelImageParam extends Component<typeof PanelImageParam> {

    private dataContext = {
        PanelOneVisibility: "Visible",
        PanelTwoVisibility: "Collapsed",
        PanelButton: (value: string) => this.PanelButtonPressed(value),
        ImageButton: () => this.ImageButtonPressed(),
        Image: ImageSource.fromTextureAsset(new TextureAsset(BigInt("2279762269149554")))
    };

    private activePlayer: Player | undefined;
    private pageNumber: number = 1;

    private imageOne: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("2279762269149554")));
    private imageTwo: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("1170982894839927")));
    private imageThree: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("1103103128065766")));
    private imageFour: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("819900053707113")));
    private imageFive: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("762879723318835")));
    private imageSix: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("758821940443212")));
    private imageSeven: ImageSource = ImageSource.fromTextureAsset(new TextureAsset(BigInt("581723008258813")));

    private imageArray: ImageSource[] = [
        this.imageOne,
        this.imageTwo,
        this.imageThree,
        this.imageFour,
        this.imageFive,
        this.imageSix,
        this.imageSeven
    ];

    private imageIndex: number = 0;

    start() {
        this.activePlayer = this.world.getLocalPlayer();

        if (this.activePlayer !== this.world.getServerPlayer()) {
            this.entity.as(NoesisGizmo).dataContext = this.dataContext;
            this.PreloadImages();
        }
    }

    PreloadImages() {
        this.imageArray.forEach((image) => {
            this.dataContext.Image = image;
        });
        this.dataContext.Image = this.imageArray[this.imageIndex];
    }

    PanelButtonPressed(value: string) {
        this.pageNumber += parseInt(value);

        if (this.pageNumber === 1) {
            this.dataContext.PanelOneVisibility = "Visible";
            this.dataContext.PanelTwoVisibility = "Collapsed";
        }
        else if (this.pageNumber === 2) {
            this.dataContext.PanelOneVisibility = "Collapsed";
            this.dataContext.PanelTwoVisibility = "Visible";
        }
    }

    ImageButtonPressed() {
        this.imageIndex = (this.imageIndex + 1) % this.imageArray.length;
        this.dataContext.Image = this.imageArray[this.imageIndex];
    }
}

Component.register(PanelImageParam);
