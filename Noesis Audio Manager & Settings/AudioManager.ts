import { CodeBlockEvents, Component, Player, NetworkEvent, PropTypes, Entity, AudioGizmo, clamp, LocalEvent } from 'horizon/core';
import { AudioData } from './PlayerData';

// Enum for different types of audio managed by the system
// To be imported by the script that want to play an audio gizmo.
export enum AudioType {
    MUSIC = "Music",
    SFX = "SFX",
    AMBIENT = "Ambient",
    UI = "UI",
    NOTIFICATION = "Notification"
}

// Maps to track audio data and audio gizmos for each player
const allPlayerAudioData = new Map<Player, AudioData>();
const allPlayerMusic = new Map<Player, AudioGizmo>();
const allPlayerAmbient = new Map<Player, AudioGizmo>();

// Constants for persistent storage variable versioning and naming
// A player persistent object variable must be created with the name "PlayerData:Audio"
const playerDataAudioVarVersion = 1;
const playerDataAudioVarName = "PlayerData:Audio";

/* Network events for synchronizing audio data and playback across clients
   To be imported by the script that want to play an audio gizmo
   Local variants are also created for triggering from the same client
*/
export const setPlayerAudioData = new NetworkEvent<{ player: Player, playerAudioData: AudioData }>('SetPlayerAudioData');
export const playAudioGizmo = new NetworkEvent<{ player: Player, audioEntity: Entity, audioType: AudioType }>('playAudioGizmo');
export const playAudioGizmoLocal = new LocalEvent<{ player: Player, audioEntity: Entity, audioType: AudioType }>('playAudioGizmo');
export const savePlayerAudioData = new NetworkEvent<{ player: Player }>('SavePlayerAudioData');
export const savePlayerAudioDataLocal = new LocalEvent<{ player: Player }>('SavePlayerAudioData');
class AudioManager extends Component<typeof AudioManager> {
    static propsDefinition = {
        isTesting: { type: PropTypes.Boolean, default: false }, // If true, player audio data is saved on every change (for testing purposes)
        isLogging: { type: PropTypes.Boolean, default: false }, // If true, logs actions to the console
        audioSettings: { type: PropTypes.Entity }, // The Noesis Audio Settings UI entity
    };

    // Setup event connections when component is initialized
    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerFocusUI, (player: Player, focusedOn: Entity) => this.OnPlayerFocusUI(player, focusedOn));
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerUnfocusUI, (player: Player, unfocusedFrom: Entity) => this.OnPlayerUnfocusUI(player, unfocusedFrom));
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => this.OnPlayerEnterWorld(player));
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitWorld, (player: Player) => this.OnPlayerExitWorld(player));

        this.connectNetworkEvent(this.entity, setPlayerAudioData, ({ player, playerAudioData }) => this.SetPlayerAudioData(player, playerAudioData));
        this.connectNetworkEvent(this.entity, playAudioGizmo, ({ player, audioEntity, audioType }) => this.PlayAudioGizmo(player, audioEntity, audioType));
        this.connectLocalEvent(this.entity, playAudioGizmoLocal, ({ player, audioEntity, audioType }) => this.PlayAudioGizmo(player, audioEntity, audioType));
        // Currently unused, but can be triggered to save player audio data on demand.
        this.connectNetworkEvent(this.entity, savePlayerAudioData, ({ player }) => this.SavePlayerAudioData(player));
        this.connectLocalEvent(this.entity, savePlayerAudioDataLocal, ({ player }) => this.SavePlayerAudioData(player));
    }

    start() { }

    // Handles player entering the world: initializes and syncs audio data
    OnPlayerEnterWorld(player: Player) {
        if (this.props.isLogging) console.log(`AudioManager: Player ${player.name} has entered the world.`);

        // Delay to ensure player has fully loaded and Noesis Audio Settings UI is ready
        this.async.setTimeout(() => {
            // Retrieve previous audio data from persistent storage
            const prePlayerAudioData: AudioData | null = this.world.persistentStorage.getPlayerVariable(player, playerDataAudioVarName);
            // Initialize audio data for the player
            const newPlayerAudioData = this.InitializeAudioData(player, prePlayerAudioData);
            allPlayerAudioData.set(player, newPlayerAudioData);
            // Sync audio data to client. The Noesis Audio Settings UI will recieve this data.
            this.sendNetworkEvent(player, setPlayerAudioData, { player: player, playerAudioData: newPlayerAudioData });
        }, 1000);
    }

    // Handles player exiting the world: saves and cleans up audio data
    OnPlayerExitWorld(player: Player) {
        if (this.props.isLogging) console.log(`AudioManager: Player ${player.name} has exited the world.`);

        const playerAudioData = allPlayerAudioData.get(player);

        // Save audio data to persistent storage. Must be done this frame.
        if (playerAudioData) this.world.persistentStorage.setPlayerVariable(player, playerDataAudioVarName, playerAudioData);

        // Remove player from all audio maps
        allPlayerAudioData.delete(player);
        allPlayerMusic.delete(player);
        allPlayerAmbient.delete(player);
    }

    // Handles UI unfocus event: resumes player audio
    OnPlayerUnfocusUI(player: Player, unfocusedFrom: Entity) {
        if (this.props.isLogging) console.log(`AudioManager: Player ${player.name} unfocused from entity ${unfocusedFrom.name}.`);
        if (unfocusedFrom !== this.props.audioSettings) return;

        this.PlayPlayerAudio(player);
    }

    // Handles UI focus event: pauses player audio
    OnPlayerFocusUI(player: Player, focusedOn: Entity) {
        if (this.props.isLogging) console.log(`AudioManager: Player ${player.name} focused on entity ${focusedOn.name}.`);
        if (focusedOn !== this.props.audioSettings) return;

        this.PausePlayerAudio(player);
    }

    // Pauses music and ambient audio for the player
    PausePlayerAudio(player: Player) {
        if (this.props.isLogging) console.log("AudioManager: Pausing Player Audio");

        const musicAudio = allPlayerMusic.get(player);
        const ambientAudio = allPlayerAmbient.get(player);

        if (musicAudio) musicAudio.pause();
        if (ambientAudio) ambientAudio.pause();
    }

    // Plays music and ambient audio for the player based on player mute and volume settings
    PlayPlayerAudio(player: Player) {
        if (this.props.isLogging) console.log("AudioManager: Playing Player Audio");

        const playerAudioData = allPlayerAudioData.get(player);

        if (!playerAudioData) return;

        const playerMusic = allPlayerMusic.get(player);
        const playerAmbient = allPlayerAmbient.get(player);

        if (playerMusic) {
            playerMusic.volume.set(clamp(playerAudioData.musicVolume, 0, 100) / 100);
            playerMusic.play({ fade: 0, players: [player] });
        }
        if (playerAmbient) {
            playerAmbient.volume.set(clamp(playerAudioData.ambientVolume, 0, 100) / 100);
            playerAmbient.play({ fade: 0, players: [player] });
        }
    }

    // Updates audio data for the player and optionally saves it
    SetPlayerAudioData(player: Player, playerAudioData: AudioData) {
        if (this.props.isLogging) console.log("AudioManager: Setting Player Audio Data");

        allPlayerAudioData.set(player, playerAudioData);

        if (this.props.isTesting) this.SavePlayerAudioData(player);
    }

    // Saves the player's audio data to persistent storage
    SavePlayerAudioData(player: Player) {
        if (this.props.isLogging) console.log("AudioManager: Saving Player Audio Data");

        const playerAudioData = allPlayerAudioData.get(player);

        if (playerAudioData) this.world.persistentStorage.setPlayerVariable(player, playerDataAudioVarName, playerAudioData);
    }

    // Plays an audio gizmo for the player, setting the correct volume based on type
    PlayAudioGizmo(player: Player, audioEntity: Entity, audioType: AudioType) {
        if (this.props.isLogging) console.log("AudioManager: Playing Audio Gizmo");

        const audio = audioEntity.as(AudioGizmo);
        const audioData = allPlayerAudioData.get(player);

        if (!audio || !audioData) return;

        console.log(audioType);
        // Determine volume and update audio maps based on audio type
        switch (audioType) {
            case AudioType.MUSIC:
                audio.volume.set(clamp(audioData.musicVolume, 0, 100) / 100);
                allPlayerMusic.set(player, audio);
                break;
            case AudioType.SFX:
                audio.volume.set(clamp(audioData.sfxVolume, 0, 100) / 100);
                break;
            case AudioType.AMBIENT:
                audio.volume.set(clamp(audioData.ambientVolume, 0, 100) / 100);
                allPlayerAmbient.set(player, audio);
                break;
            case AudioType.UI:
                audio.volume.set(clamp(audioData.uiVolume, 0, 100) / 100);
                break;
            case AudioType.NOTIFICATION:
                audio.volume.set(clamp(audioData.notificationVolume, 0, 100) / 100);
                break;
        }

        audio.play({ fade: 0, players: [player] });
    }

    // Initializes audio data for a player, using previous data if available and compatible
    InitializeAudioData(player: Player, prePlayerAudioData: AudioData | null): AudioData {
        if (this.props.isLogging) console.log("AudioManager: Initializing Player Audio Data");
        const newPlayerAudioData: AudioData = {
            version: playerDataAudioVarVersion,
            musicVolume: 50,
            sfxVolume: 50,
            ambientVolume: 50,
            uiVolume: 50,
            notificationVolume: 50,
            isMuted: false,
        }

        // If previous data exists and is compatible, copy values
        if (prePlayerAudioData && prePlayerAudioData.version >= playerDataAudioVarVersion) {
            newPlayerAudioData.musicVolume = prePlayerAudioData.musicVolume;
            newPlayerAudioData.sfxVolume = prePlayerAudioData.sfxVolume;
            newPlayerAudioData.ambientVolume = prePlayerAudioData.ambientVolume;
            newPlayerAudioData.uiVolume = prePlayerAudioData.uiVolume;
            newPlayerAudioData.notificationVolume = prePlayerAudioData.notificationVolume;
            newPlayerAudioData.isMuted = prePlayerAudioData.isMuted;
        }

        return newPlayerAudioData;
    }
}
// Register the AudioManager component
Component.register(AudioManager);