import {Patient} from '../../common/collections/patient.js';

// Config
import '../configs/security.js';

Patient.permit(['insert'])
    .Dental_ifDataInsert()
    .allowInClientCode();
Patient.permit(['update'])
    .Dental_ifDataUpdate()
    .allowInClientCode();
Patient.permit(['remove'])
    .Dental_ifDataRemove()
    .allowInClientCode();
