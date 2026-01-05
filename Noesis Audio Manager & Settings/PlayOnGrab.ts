import { Component, CodeBlockEvents, Player, PropTypes, AudioGizmo } from 'horizon/core';
import { playAudioGizmo, AudioType } from './AudioManager';

class PlayOnGrab extends Component<typeof PlayOnGrab> {
    static propsDefinition = {
        audioManager: { type: PropTypes.Entity },
        grabAudioGizmo: { type: PropTypes.Entity },
    };

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (isRightHand: boolean, player: Player) => this.OnGrabStart(player));
    }

    start() { }

    OnGrabStart(player: Player) {
        if (!this.props.grabAudioGizmo || !this.props.audioManager) return;

        const grabAudio = this.props.grabAudioGizmo.as(AudioGizmo);
        this.sendNetworkEvent(this.props.audioManager, playAudioGizmo, { player: player, audioEntity: grabAudio , audioType: AudioType.SFX });
    }
}
Component.register(PlayOnGrab);