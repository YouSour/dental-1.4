import {Customer} from '../../common/collections/customer.js';

// Config
import '../configs/security.js';

Customer.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Customer.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Customer.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
