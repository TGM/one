/* ------------------------------------------------------------------------- *
 * Copyright 2002-2023, OpenNebula Project, OpenNebula Systems               *
 *                                                                           *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may   *
 * not use this file except in compliance with the License. You may obtain   *
 * a copy of the License at                                                  *
 *                                                                           *
 * http://www.apache.org/licenses/LICENSE-2.0                                *
 *                                                                           *
 * Unless required by applicable law or agreed to in writing, software       *
 * distributed under the License is distributed on an "AS IS" BASIS,         *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
 * See the License for the specific language governing permissions and       *
 * limitations under the License.                                            *
 * ------------------------------------------------------------------------- */
import { INPUT_TYPES, T } from 'client/constants'
import { Field, getObjectSchemaFromFields, arrayToOptions } from 'client/utils'
import { boolean, string } from 'yup'

/**
 * Creates a function to define the fieldProps and can disable a switch using his own name.
 *
 * @param {string} name - Name of the field
 * @returns {Function} - The function to check if the field is disabled
 */
const checkDisabled = (name) => (type) => ({ disabled: type === name })

/** @type {Field} View field */
const VIEW = (name, admin) => ({
  name: admin ? `GROUP_ADMIN_VIEWS.${name}` : `VIEWS.${name}`,
  label: name,
  type: INPUT_TYPES.SWITCH,
  dependOf: admin ? `GROUP_ADMIN_DEFAULT_VIEW` : `DEFAULT_VIEW`,
  watcher: (value, nameField) => {
    // Check the switch if it is the default view
    const view =
      nameField.split('.').length === 3 ? nameField.split('.')[2] : undefined
    if (value === view) return true
  },
  validation: boolean(),
  grid: { md: 12 },
})

/** @type {Field} Default view field */
const DEFAULT_VIEW = (views, admin) => ({
  name: admin ? `GROUP_ADMIN_DEFAULT_VIEW` : `DEFAULT_VIEW`,
  label: T['groups.views.default'],
  type: INPUT_TYPES.SELECT,
  values: arrayToOptions(views, {
    addEmpty: false,
  }),
  validation: string().default(() => (admin ? 'groupadmin' : 'cloud')),
  grid: { md: 9 },
})

/**
 * Generates view fields.
 *
 * @param {Array} views - Array with view names
 * @param {boolean} admin - Create field for the admin group user
 * @returns {Array} - Array of view fields
 */
const VIEWS_FIELDS = (views, admin) => {
  // Add first the field of default view
  const fields = [DEFAULT_VIEW(views, admin)]

  // Iterate over each view to generate a field
  views.forEach((view) => {
    // Create a view field
    const newView = VIEW(view, admin)

    // Add function to disable or not the field (the field will be disabled if the default value is equals to the name of the field)
    newView.fieldProps = checkDisabled(view)

    // Push field
    fields.push(newView)
  })

  // Return fields
  return fields
}

/**
 * Generates view schema.
 *
 * @param {Array} views - Array with view names
 * @returns {object} - Schema of view fields
 */
const VIEWS_SCHEMA = (views) =>
  getObjectSchemaFromFields(VIEWS_FIELDS(views, false)).concat(
    getObjectSchemaFromFields(VIEWS_FIELDS(views, true))
  )

/** Export fields and schema */
export { VIEWS_SCHEMA, VIEWS_FIELDS }
