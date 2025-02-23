import type { Core } from '@strapi/strapi';
import { get, isEmpty, transform } from 'lodash';
import { Event } from '@strapi/database/dist/lifecycles';
import { BaseAttribute } from '@strapi/database/dist/types';
import { errors } from '@strapi/utils';

type Attribute = BaseAttribute & { fieldName: string };

// This function will be called when the Strapi server is bootstrapped
const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.db.lifecycles.subscribe({
    async beforeCreate(event) {
      await validateRelations(event, strapi);
    },

    async beforeUpdate(event) {
      await validateRelations(event, strapi);
    },
  });
};

// This function will validate if the required relations are present
async function validateRelations(event: Event, strapi: Core.Strapi) {
  const requiredRelations = transform(
    event.model.attributes,
    (acc: Attribute[], attr: BaseAttribute, fieldName: string) => {
      if (attr.type === 'relation' && attr.required) {
        acc.push({ ...attr, fieldName });
      }
      return acc;
    },
    []
  );

  if (isEmpty(requiredRelations)) return;

  for (const relation of requiredRelations) {
    const { fieldName: field } = relation;
    const data = event.params.data[field];

    const failedMsg = `Field '${field}' cannot be empty.`;
    const validationError = new errors.ValidationError(failedMsg, {
      path: field,
      message: failedMsg,
    });

    // When creating, check if the relation is empty
    if (event.action === 'beforeCreate' && isEmpty(get(data, 'connect'))) {
      throw validationError;
    }

    if (event.action === 'beforeUpdate') {
      // If there are no change in the relation, skip the validation
      if (isEmpty(get(data, 'connect')) && isEmpty(get(data, 'disconnect'))) {
        continue;
      }

      // Check the current number of records in the DB
      const existingEntry = await strapi.db
        .query(event.model.uid)
        .findOne({ where: event.params.where });

      const currentRelations = existingEntry?.[field] || [];
      const disconnecting = data.disconnect || [];
      const remainingCount = currentRelations.length - disconnecting.length;

      // If there are no remaining relations, and no new ones are being connected, throw an error
      if (remainingCount <= 0 && isEmpty(data.connect)) {
        throw validationError;
      }
    }
  }
}

export default bootstrap;
