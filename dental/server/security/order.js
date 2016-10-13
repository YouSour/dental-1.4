import {Order} from '../../common/collections/order.js';

// Config
import '../configs/security.js';

Order.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Order.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Order.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
