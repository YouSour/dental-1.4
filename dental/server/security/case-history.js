import {CaseHistory} from '../../common/collections/case-history.js';

// Config
import '../configs/security.js';

CaseHistory.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
