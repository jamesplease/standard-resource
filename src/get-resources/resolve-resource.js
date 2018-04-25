import lookupRelationship from './lookup-relationship';
import evaluateComputedAttributes from './evaluate-computed-attributes';

// This function handles pulling in relationships and/or flattening
// the resource
export default function resolveResource(state, resource, options = {}) {
  const { flat, relationships } = options;

  if (!resource) {
    return;
  }

  // TODO: warn if resource is malformed

  let resolvedRelationships = resource.relationships || {};
  if (relationships) {
    // If the user passes `true`, then that means they want to resolve every relationship.
    // Otherwise, they will pass an object specifying the specific relationships that they
    // want to resolve.
    const objectToIterate =
      typeof relationships === 'boolean'
        ? resolvedRelationships
        : relationships;
    for (let relationshipKey in objectToIterate) {
      let relationshipDefinition = resource.relationships[relationshipKey];

      // TODO: warn if relationship requested does not exist

      if (relationshipDefinition instanceof Array) {
        relationshipDefinition = {
          resourceType: relationshipKey,
          ids: relationshipDefinition,
        };
      }

      resolvedRelationships[relationshipKey] = lookupRelationship(
        state,
        relationshipDefinition
      );
    }
  }

  let computedAttributes = evaluateComputedAttributes(state, resource, options);

  if (flat) {
    return {
      ...resource.meta,
      ...resolvedRelationships,
      ...computedAttributes,
      ...resource.attributes,
      resourceType: resource.resourceType,
      id: resource.id,
    };
  } else {
    return {
      meta: resource.meta || {},
      relationships: resolvedRelationships,
      computedAttributes,
      attributes: resource.attributes || {},
      resourceType: resource.resourceType,
      id: resource.id,
    };
  }
}