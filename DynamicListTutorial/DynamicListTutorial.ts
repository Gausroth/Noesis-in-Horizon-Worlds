import { CodeBlockEvents, Component, Entity, Player} from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';

type PlaterData = {
    ID: number,
    Name: string,
}
class DynamicListTutorial extends Component<typeof DynamicListTutorial> {

    private dataContext = {
        Players: [{ ID: 0, Name: "ServerPlayer" }]
    }

    private players: PlaterData[] = [];

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerFocusUI, (player: Player, focusedOn: Entity) => this.AddPlayer(player));
    }

    start() {
        this.entity.as(NoesisGizmo).dataContext = this.dataContext;
        this.dataContext.Players = this.players;
    }

    AddPlayer(player: Player) {
        if (this.players.find(p => p.Name === player.name.get())) return;
        this.players.push({ ID: player.id, Name: player.name.get() });
        this.dataContext.Players = this.players;

        this.async.setTimeout(() => {
            this.AddRandomPlayer();
        }, 1000);
    }

    AddRandomPlayer() {
        const randomID = Math.floor(Math.random() * 90) + 10;
        const randomName = Math.random().toString(36).substring(2, 22);
        this.players.push({ ID: randomID, Name: randomName });
        this.dataContext.Players = this.players;

        this.async.setTimeout(() => {
            this.AddRandomPlayer();
        }, 1000);
    }
}

Component.register(DynamicListTutorial);
