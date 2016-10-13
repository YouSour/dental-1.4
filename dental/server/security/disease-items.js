import {DiseaseItems} from '../../common/collections/disease-items.js';

// Config
import '../configs/security.js';

DiseaseItems.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
