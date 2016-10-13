import {DiseaseCategories} from '../../common/collections/disease-categories.js';

// Config
import '../configs/security.js';

DiseaseCategories.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
