import {Deposit} from '../../common/collections/deposit.js';

// Config
import '../configs/security.js';

Deposit.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Deposit.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Deposit.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
