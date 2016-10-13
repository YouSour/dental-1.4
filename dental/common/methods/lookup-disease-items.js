import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {DiseaseItems} from '../collections/disease-items.js';

// Check user password
export const lookupDiseaseItems = new ValidatedMethod({
    name: 'dental.lookupDiseaseItems',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        itemId: {type: String}
    }).validator(),
    run({itemId}) {
        if (!this.isSimulation) {
            return DiseaseItems.findOne({_id: itemId});
        }
    }
});