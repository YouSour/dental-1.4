import {Item} from '../../common/collections/item.js';

// Config
import '../configs/security.js';

Item.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
