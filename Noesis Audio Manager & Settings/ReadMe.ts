/*
Noesis Audio Manager & Settings ? 2025 by GausRoth is licensed under Creative Commons Attribution 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by/4.0/

YouTube Video: TBD

Welcome to the Noesis Audio Manager & Settings!

This is a public asset pack created by GausRoth, designed to enhance your audio experience using Noesis UI.
This asset pack provides a comprehensive set of audio management tools and settings that can be easily integrated into your projects.

This pack includes:
* Scripts:
** AudioManager.cs - A default script for core audio management.
** AudioSettings.cs - A shared script for managing audio settings.
** PlayerData.cs - A default script for handling player-specific data.
** PlayOnGrab.cs - A default script to play audio when an object is grabbed.
** PlayOnStart.cs - A default script to play audio when the player enters the world.

* Objects:
** AudioManager: An empty object with the AudioManager.cs script attached.
** AudioSettings: A Noesis Gizmo for the AudioSettings.xaml file and the AudioSettings.cs script attached.
** Astral Projection: An audio gizmo for a music file.
** Coin Pickup: An audio gizmo for a coin pickup sound effect.
** PlayOnStart: An empty object with the PlayOnStart.cs script attached and the AudioManager & Astral Projection audio gizmo assigned.
** PlayOnGrab: A grabbable cube object with the PlayOnGrab.cs script attached and the AudioManager & Coin Pickup audio gizmo assigned.

What You Need To Do:
* Activate the Noesis API:
** Go to Scripts > Script settings > API
** Toggle on horizon/noesis

* Create the PlayerData:Audio player persistent data object.
** Go to Systems > Variable Groups > +
** Set Name to PlayerData
** Toggle on "Add to this world"
** Click Create
** Click on PlayerData > +
** Set Variable Type to Player Persistent Variable
** Set Name to Audio
** Set Data Type to Object
** Click Create

How to play an audio gizmo using this asset pack:
* Import playAudioGizmo & AudioType from the AudioManager script.
** Example: import { playAudioGizmo, AudioType } from './AudioManager';
* send a network or local event to the AudioManager entity using the playAudioGizmo event.
** Example: this.sendNetworkEvent(this.props.audioManager, playAudioGizmo, { player: player, audioEntity: startAudio, audioType: AudioType.MUSIC });
* Ensure you pass the correct AudioType for the audio gizmo being played.

Potential Issues:
* Warning: Can't get value for PlayerData:Audio. PlayerData:Audio was deleted or never existed.
* Solution: See "Create the PlayerData:Audio player persistent data object" above.

* Error: Cannot find module 'horizon/noesis' or its corresponding type declarations.
* Solution: See "Activate the Noesis API" above.

* Error: Failed to call method 'start' on script component instance: TypeError: Cannot read properties of undefined (reading 'NoesisGizmo')
* Solution: See "Activate the Noesis API" above.

* Error: PlayerData Name already in use.
* Solution1: Change the Name to something unique. Make sure you also change it in the AudioManager.cs script.
* Solution2: Add your current PlayerData variable group to the world. If the issue persists, shutdown the server and rejoin.
*/