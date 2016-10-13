import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Patient} from '../collections/patient.js';

// Check user password
export const lookupPatient = new ValidatedMethod({
    name: 'dental.lookupPatient',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        patientId: {type: String}
    }).validator(),
    run({patientId}) {
        if (!this.isSimulation) {
            return Patient.findOne({_id: patientId});
        }
    }
});