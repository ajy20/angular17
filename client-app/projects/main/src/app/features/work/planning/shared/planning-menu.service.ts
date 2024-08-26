import { Injectable } from '@angular/core';
import { faCalendar, faChartBar, faChartLine, faClipboardList, faCogs, faCopy, faFileAlt, faHome, faList, faPeopleCarry, faRecycle, faSortAmountDown, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from '../../../../shared/side-bar/model/menu-item.model';
import { QuickLink } from '../../../../shared/side-bar/model/quick-link.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningMenuService {

  constructor() { }

  quickLinks: QuickLink[] = [
    { abbreviation: 'Q1', label: 'Label1', onClick: () => { }, active: false, data: {} },
    { abbreviation: 'Q2', label: 'Label2', onClick: () => { }, active: false, data: {} },
    { abbreviation: 'Q3', label: 'Label3', onClick: () => { }, active: false, data: {} }
  ]


  menuItems: MenuItem[] = [
    {
      id: '1', label: 'Backlog', icon: faList, children: [
        { id: '11', label: 'Backlog', icon: faClipboardList, route: ['backlog'] },
        { id: '13', label: 'Priorities', icon: faSortAmountDown, route: ['priorities'] },
        { id: '14', label: 'Dependencies', icon: faPeopleCarry, route: ['efforts'] }, // TODO
      ]
    },
    {
      id: '1a', label: 'Team (to be updated)', icon: faList, children: [
        { id: '11', label: 'Team Backlog', icon: faClipboardList, route: ['backlog'] },
        { id: '14', label: 'Efforts', icon: faPeopleCarry, route: ['efforts'] },
      ]
    },
    {
      id: '2', label: 'Planning', icon: faCalendar, children: [
        { id: '21', label: 'Planning Scenarios', icon: faCopy, route: ['scenarios'] },
        { id: '22', label: 'Team Capacity', icon: faUsers, route: ['capacity'] },
      ]
    },

    {
      id: '3', label: 'Execution', icon: faCogs, children: [
        { id: '31', label: 'PI Commitment Summary', icon: faFileAlt, route: ['commitment'] },
        { id: '32', label: 'Retrospective', icon: faRecycle, route: ['retrospective'] },
      ]
    },

    {
      id: '4', label: 'Charts', icon: faChartLine, children: [
        { id: '41', label: 'PI Stats', icon: faChartBar, route: ['stats'] },
      ]
    },
  ];

}
