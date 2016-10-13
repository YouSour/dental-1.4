import {Staff} from '../../common/collections/staff.js';

// Config
import '../configs/security.js';

Staff.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Staff.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Staff.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
