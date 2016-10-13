import {Register} from '../../common/collections/register.js';

// Config
import '../configs/security.js';

Register.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Register.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Register.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
