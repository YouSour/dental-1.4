import {LookupValue} from '../../common/collections/lookup-value.js';

// Config
import '../configs/security.js';

LookupValue.permit(['insert', 'update', 'remove'])
    .Dental_ifSetting()
    .allowInClientCode();
