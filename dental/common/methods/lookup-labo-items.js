import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {LaboratoryItems} from '../collections/laboratory-items.js';

// Check user password
export const lookupLaboItems = new ValidatedMethod({
    name: 'dental.lookupLaboItems',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        labo: {type: String}
    }).validator(),
    run({labo}) {
        if (!this.isSimulation) {
            return LaboratoryItems.findOne({_id: labo});
        }
    }
});