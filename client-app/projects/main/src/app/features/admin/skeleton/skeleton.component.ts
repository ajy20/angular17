import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faBalanceScale, faDollarSign, faGlobe, faHome, faIndustry, faLightbulb, faMoneyBill, faPaperPlane, faSitemap, faStoreAlt, faTable, faTools, faUserCog, faUserEdit, faUserLock, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons';
import { PageWrapperComponent } from '../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../shared/side-bar/model/menu-item.model';
import { QuickLink } from '../../../shared/side-bar/model/quick-link.model';
  
@Component({
  selector: 'csps-skeleton',
  standalone: true,
  imports: [PageWrapperComponent, RouterModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  // The menu items, quickLinks
  menuItems: MenuItem[] = [
    {
      id: '1', label: 'General', icon: faHome, children: [
        { id: '11', label: 'Products', icon: faHome, route: ['products'] },
        { id: '12', label: 'Factories', icon: faIndustry, route: ['factories'] },
        { id: '13', label: 'Currencies', icon: faMoneyBill, route: ['currencies'] },
        { id: '14', label: 'Dimensions', icon: faBalanceScale, route: ['dimensions'] },
      ]
    },
    {
      id: '2', label: 'Users', icon: faUsers, children: [
        { id: '21', label: 'Groups', icon: faUsers, route: ['groups'] },
        { id: '22', label: 'Roles', icon: faUsersCog, route: ['roles'] },
        { id: '23', label: 'Permissions', icon: faUserLock, route: ['permissions'] },
        { id: '24', label: 'Proxy Signatures', icon: faUserEdit, route: ['proxies'] },
        { id: '25', label: 'Assignment Matrix', icon: faTable, route: ['assignments'] },
      ]
    },
    {
      id: '3', label: 'Selection Navigator', icon: faUsers, children: [
        { id: '31', label: 'Business Units', icon: faStoreAlt, route: ['business-units'] },
        { id: '32', label: 'Areas', icon: faGlobe, route: ['areas'] },
        { id: '33', label: 'User Types', icon: faUserCog, route: ['user-types'] },
        { id: '34', label: 'Export Groups', icon: faPaperPlane, route: ['export-groups'] },
        { id: '35', label: 'Upload Regions', icon: faPaperPlane, route: ['upload-regions'] },
        { id: '36', label: 'Price Reports', icon: faDollarSign, route: ['price-reports'] },
        { id: '37', label: 'SR Types', icon: faLightbulb, route: ['sr-types'] }
      ]
    },
    {
      id: '4', label: 'Tools', icon: faTools, children: [
        { id: '41', label: 'Site Map', icon: faSitemap, route: ['site-map'] },
      ]
    }
  ];
  quickLinks!: QuickLink[];

  constructor() { }
}
