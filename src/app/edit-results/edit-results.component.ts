import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {Participant} from "../shared/data/participant";
import {IdAndLabel} from "../shared/data/id-and-label";
import {Game} from "../shared/data/game";
import {ResultService} from "../shared/result.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "../messages/message.service";
import {map, switchMap} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {EditResultsDialogComponent} from "../edit-results-dialog/edit-results-dialog.component";

@Component({
  selector: 'bmm-edit-games',
  templateUrl: './edit-results.component.html',
  styleUrls: ['./edit-results.component.scss']
})
export class EditResultsComponent implements OnChanges {
  availableHomePlayers: Participant[] = [];
  availableAwayPlayers: Participant[] = [];
  selectedHomePlayers: Participant[] = [];
  selectedAwayPlayers: Participant[] = [];
  numberOfBoards: number = 0;
  availableReferees: IdAndLabel[] = [];
  selectedReferee?: IdAndLabel;
  games: Game[] = [];

  constructor(private resultService: ResultService,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageService,
              public dialog: MatDialog) {
    this.setupData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setupData();
  }

  private setupData() {
    this.route.paramMap.pipe(
        map(params => params.get('matchId')!),
        switchMap(matchId =>
            this.resultService.getMatchFoundation(parseInt(matchId)))
    ).subscribe(response => {
      this.availableHomePlayers = response.availableHomePlayers;
      this.availableAwayPlayers = response.availableAwayPlayers;
      this.selectedHomePlayers = response.selectedHomePlayers;
      this.selectedAwayPlayers = response.selectedAwayPlayers;
      this.numberOfBoards = response.numberOfBoards;
      this.availableReferees = response.availableReferees;
      this.selectedReferee = response.selectedReferee;
      this.games = response.games;
    });
  }

  private participantsChanged() {
    if(!this.games) {
      return false;
    }
    if(this.games.length != this.numberOfBoards) {
      return true;
    }
    for (let i = 0; i < this.games.length; i++) {
      if(this.selectedHomePlayers.at(i) != this.games.at(i)!.homeParticipant) {
        return true;
      }
      if(this.selectedAwayPlayers.at(i) != this.games.at(i)!.awayParticipant) {
        return true;
      }
    }
    return false;
  }

  submit() {
    if(this.numberOfBoards != this.selectedHomePlayers.length
        || this.numberOfBoards != this.selectedAwayPlayers.length) {
      this.messageService.error("Es wurde nicht die richtige Anzahl Spieler ausgewählt!");
      return;
    }
    if(!this.selectedReferee) {
      this.messageService.error("Es muss ein Schiedsrichter ausgewählt sein!");
      return;
    }
    if (this.participantsChanged()) {
      for(let game of this.games) {
        game.result.label = '?:?';
      }
    }
    let dialogRef;
    dialogRef = this.dialog.open(EditResultsDialogComponent, {
      data: {
        results: this.games,
        closeMatch: false
      }
    });
    dialogRef.afterClosed().subscribe( result => {
      if (result != "cancel") {
        //this.resultService.putResult()
      }
    });
  }

}
