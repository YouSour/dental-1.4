import {LaboratoryItems} from '../../common/collections/laboratory-items.js';

// Config
import '../configs/security.js';

LaboratoryItems.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
