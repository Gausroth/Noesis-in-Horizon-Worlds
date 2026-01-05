import { Component, PropTypes, AudioGizmo, CodeBlockEvents, Player } from 'horizon/core';
import { playAudioGizmo, AudioType } from './AudioManager';

class PlayOnStart extends Component<typeof PlayOnStart> {
    static propsDefinition = {
        audioManager: { type: PropTypes.Entity },
        startAudioGizmo: { type: PropTypes.Entity },
    };

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => this.OnPlayerEnterWorld(player));
    }

    start() { }

    OnPlayerEnterWorld(player: Player) {
        this.async.setTimeout(() => {
            if (!this.props.startAudioGizmo || !this.props.audioManager) return;

            const startAudio = this.props.startAudioGizmo.as(AudioGizmo);
            this.sendNetworkEvent(this.props.audioManager, playAudioGizmo, { player: player, audioEntity: startAudio, audioType: AudioType.MUSIC });
        }, 1000);
    }
}
Component.register(PlayOnStart);