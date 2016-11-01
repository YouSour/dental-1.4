import {Payment} from '../../common/collections/payment.js';

// Config
import '../configs/security.js';

Payment.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Payment.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Payment.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
