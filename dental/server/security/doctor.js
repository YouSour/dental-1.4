import {Doctor} from '../../common/collections/doctor.js';

// Config
import '../configs/security.js';

Doctor.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Doctor.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Doctor.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
