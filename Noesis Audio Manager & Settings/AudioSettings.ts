import { PropTypes, Component, Player, NetworkEvent, CodeBlockEvents, Entity, AudioGizmo } from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';
import { AudioData } from './PlayerData';
import { setPlayerAudioData, AudioType } from './AudioManager';
class AudioSettings extends Component<typeof AudioSettings> {
    static propsDefinition = {
        isLogging: { type: PropTypes.Boolean, default: false }, //Enable or disable logging for debugging.
        audioManager: { type: PropTypes.Entity }, //Reference to the audio manager entity for network communication.
        audioTestSound: { type: PropTypes.Entity }, //Reference to a test sound entity to play when sliders lose focus.
    };

    //Data context for UI binding, including slider values, text labels, and event handlers for UI actions.
    private dataContext = {
        MusicSliderValue: 50,
        SFXSliderValue: 50,
        AmbientSliderValue: 50,
        UISliderValue: 50,
        NotificationSliderValue: 50,
        MusicTextValue: AudioType.MUSIC + ": 50%",
        SFXTextValue: AudioType.SFX + ": 50%",
        AmbientTextValue: AudioType.AMBIENT + ": 50%",
        UITextValue: AudioType.UI + ": 50%",
        NotificationTextValue: AudioType.NOTIFICATION + ": 50%",
        MusicSliderMoved: (value: unknown) => this.SliderMoved(AudioType.MUSIC, value as number),
        SFXSliderMoved: (value: unknown) => this.SliderMoved(AudioType.SFX, value as number),
        AmbientSliderMoved: (value: unknown) => this.SliderMoved(AudioType.AMBIENT, value as number),
        UISliderMoved: (value: unknown) => this.SliderMoved(AudioType.UI, value as number),
        NotificationSliderMoved: (value: unknown) => this.SliderMoved(AudioType.NOTIFICATION, value as number),
        DefaultSettingsPressed: () => this.DefaultSettingsPressed(),
        MutePressed: () => this.MutePressed(),
        SliderLostFocus: (value: unknown) => this.SliderLostFocus(value as string),
        MuteTextValue: "Mute"
    }

    private activePlayer: Player | undefined;
    private isMuted: boolean = false;
    private playerAudioData: AudioData | undefined;

    //Connects to the OnPlayerUnfocusUI event before the component starts.
    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerUnfocusUI, (player: Player, unfocusedFrom: Entity) => this.OnPlayerUnfocusUI(player, unfocusedFrom));
    }

    //Initializes the component, sets up data context and network event listeners.
    start() {
        this.activePlayer = this.world.getLocalPlayer();

        // Only run for non-server players
        if (this.activePlayer === this.world.getServerPlayer()) return;

        // Bind data context to the UI
        this.entity.as(NoesisGizmo).dataContext = this.dataContext;

        // Listen for audio data updates from the network
        this.connectNetworkEvent(this.activePlayer, setPlayerAudioData, ({ player: player, playerAudioData: newPlayerAudioData }) => this.SetPlayerAudioData(newPlayerAudioData));
    }

    /**
     * Updates local audio data and UI when new audio data is received.
     * @param audioData The new audio data for the player.
     */
    SetPlayerAudioData(audioData: AudioData) {
        if (this.props.isLogging) console.log(`SliderTest: Received audio data for player ${this.activePlayer?.name}.`);

        this.playerAudioData = audioData;
        this.dataContext.MuteTextValue = this.playerAudioData.isMuted ? "Unmute" : "Mute";
        this.isMuted = this.playerAudioData.isMuted;
        this.SetPlayerAudioSettings();
    }

    //Sets slider values in the UI based on the current player audio data.
    SetPlayerAudioSettings() {
        if (this.props.isLogging) console.log(`SliderTest: Setting audio settings for player ${this.activePlayer?.name}.`);
        if (!this.playerAudioData) return;

        this.dataContext.MusicSliderValue = Math.round(this.playerAudioData.musicVolume);
        this.dataContext.SFXSliderValue = Math.round(this.playerAudioData.sfxVolume);
        this.dataContext.AmbientSliderValue = Math.round(this.playerAudioData.ambientVolume);
        this.dataContext.UISliderValue = Math.round(this.playerAudioData.uiVolume);
        this.dataContext.NotificationSliderValue = Math.round(this.playerAudioData.notificationVolume);
    }

    /**
     * Handles slider movement for a specific audio type.
     * Updates the corresponding text label.
     * @param slider The audio type being adjusted.
     * @param value The new slider value.
     */
    SliderMoved(slider: string, value: number) {
        let num = value;
        if (num !== 0) num = Math.round(num);

        let text = slider + ": " + num.toString() + "%";

        switch (slider) {
            case AudioType.MUSIC:
                this.dataContext.MusicTextValue = AudioType.MUSIC + ": " + Math.round(this.dataContext.MusicSliderValue) + "%";
                break;
            case AudioType.SFX:
                this.dataContext.SFXTextValue = AudioType.SFX + ": " + Math.round(this.dataContext.SFXSliderValue) + "%";
                break;
            case AudioType.AMBIENT:
                this.dataContext.AmbientTextValue = AudioType.AMBIENT + ": " + Math.round(this.dataContext.AmbientSliderValue) + "%";
                break;
            case AudioType.UI:
                this.dataContext.UITextValue = AudioType.UI + ": " + Math.round(this.dataContext.UISliderValue) + "%";
                break;
            case AudioType.NOTIFICATION:
                this.dataContext.NotificationTextValue = AudioType.NOTIFICATION + ": " + Math.round(this.dataContext.NotificationSliderValue) + "%";
                break;
        }
    }

    /**
     * Plays a test sound at the current slider's volume when the slider loses focus.
     * @param value The audio type whose slider lost focus.
     */
    SliderLostFocus(value: string) {
        if (this.props.isLogging) console.log("SliderTest: Slider lost focus, playing test sound.");
        if (!this.props.audioTestSound) {
            console.warn("SliderTest: audioTestSound is missing or null.");
            return;
        }

        const testSound = this.props.audioTestSound.as(AudioGizmo);
        let volume = 0;

        switch (value) {
            case AudioType.MUSIC:
                volume = this.dataContext.MusicSliderValue;
                break;
            case AudioType.SFX:
                volume = this.dataContext.SFXSliderValue;
                break;
            case AudioType.AMBIENT:
                volume = this.dataContext.AmbientSliderValue;
                break;
            case AudioType.UI:
                volume = this.dataContext.UISliderValue;
                break;
            case AudioType.NOTIFICATION:
                volume = this.dataContext.NotificationSliderValue;
                break;
        }

        testSound.volume.set(volume / 100);
        testSound.play();
    }

    //Resets all sliders to their default value (50) and unmutes audio.
    DefaultSettingsPressed() {
        if (this.props.isLogging) console.log("SliderTest: Resetting to default audio settings.");
        this.SetAllSliders(50);
        this.isMuted = false;
        this.dataContext.MuteTextValue = "Mute";
    }

    /**
     * Toggles mute state. If muting, sets all sliders to 0.
     * If unmuting, restores previous audio settings.
     */
    MutePressed() {
        if (this.props.isLogging) console.log("SliderTest: Toggling mute.");
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.SetAllSliders(0);
            this.dataContext.MuteTextValue = "Unmute";
        }
        else {
            this.SetPlayerAudioSettings();
            this.dataContext.MuteTextValue = "Mute";
        }
    }

    /**
     * Sets all audio sliders to a specific value and updates their text labels.
     * @param value The value to set all sliders to.
     */
    SetAllSliders(value: number) {
        if (this.props.isLogging) console.log(`SliderTest: Setting all sliders to ${value}.`);
        this.dataContext.MusicSliderValue = value;
        this.dataContext.SFXSliderValue = value;
        this.dataContext.AmbientSliderValue = value;
        this.dataContext.UISliderValue = value;
        this.dataContext.NotificationSliderValue = value;

        this.SetSliderTextValues();
    }

    //Updates the text labels for all sliders to match their current values.
    SetSliderTextValues() {
        if (this.props.isLogging) console.log("SliderTest: Updating slider text values.");

        this.dataContext.MusicTextValue = AudioType.MUSIC + ": " + this.dataContext.MusicSliderValue + "%";
        this.dataContext.SFXTextValue = AudioType.SFX + ": " + this.dataContext.SFXSliderValue + "%";
        this.dataContext.AmbientTextValue = AudioType.AMBIENT + ": " + this.dataContext.AmbientSliderValue + "%";
        this.dataContext.UITextValue = AudioType.UI + ": " + this.dataContext.UISliderValue + "%";
        this.dataContext.NotificationTextValue = AudioType.NOTIFICATION + ": " + this.dataContext.NotificationSliderValue + "%";
    }

    /**
     * Called when the player unfocuses from the UI.
     * Updates player audio data and sends it to the audio manager.
     * @param player The player who unfocused.
     * @param unfocusedFrom The entity the player unfocused from.
     */
    OnPlayerUnfocusUI(player: Player, unfocusedFrom: Entity) {
        if (this.props.isLogging) console.log(`SliderTest: Player ${player.name} unfocused from UI.`);
        if (unfocusedFrom !== this.entity) return;

        if (this.playerAudioData) {
            this.playerAudioData.musicVolume = this.dataContext.MusicSliderValue;
            this.playerAudioData.sfxVolume = this.dataContext.SFXSliderValue;
            this.playerAudioData.ambientVolume = this.dataContext.AmbientSliderValue;
            this.playerAudioData.uiVolume = this.dataContext.UISliderValue;
            this.playerAudioData.notificationVolume = this.dataContext.NotificationSliderValue;
            this.playerAudioData.isMuted = this.isMuted;
        }

        // Send updated audio data to the audio manager over the network
        if (this.props.audioManager && this.activePlayer && this.playerAudioData) {
            this.sendNetworkEvent(this.props.audioManager, setPlayerAudioData, { player: this.activePlayer, playerAudioData: this.playerAudioData });
        }
    }
}
Component.register(AudioSettings);
