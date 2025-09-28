const LookupHeader = require('../models/LookupHeader.model');
const LookupValue = require('../models/LookupValue.model');
const responses = require('../utils/responses');

// Headers
const listHeaders = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const headers = await LookupHeader.findAll(filters, { page, limit, ...req.query });
    const total = await LookupHeader.count(filters);
    
    res.json(responses.ok(headers, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Lookup headers list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch lookup headers'));
  }
};

const createHeader = async (req, res) => {
  try {
    const header = await LookupHeader.create(req.body);
    res.status(201).json(responses.created(header));
  } catch (error) {
    console.error('Create lookup header error:', error);
    res.status(500).json(responses.internalError('Failed to create lookup header'));
  }
};

const updateHeader = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingHeader = await LookupHeader.findById(id);
    if (!existingHeader) {
      return res.status(404).json(responses.notFound('Lookup header'));
    }
    
    const header = await LookupHeader.update(id, req.body);
    res.json(responses.ok(header));
  } catch (error) {
    console.error('Update lookup header error:', error);
    res.status(500).json(responses.internalError('Failed to update lookup header'));
  }
};

const deleteHeader = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingHeader = await LookupHeader.findById(id);
    if (!existingHeader) {
      return res.status(404).json(responses.notFound('Lookup header'));
    }
    
    await LookupHeader.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete lookup header error:', error);
    res.status(500).json(responses.internalError('Failed to delete lookup header'));
  }
};

// Values
const listValues = async (req, res) => {
  try {
    const { page, limit, filters } = req.pagination;
    
    const values = await LookupValue.findAll(filters, { page, limit, ...req.query });
    const total = await LookupValue.count(filters);
    
    res.json(responses.ok(values, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Lookup values list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch lookup values'));
  }
};

const getValueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const value = await LookupValue.findById(id);
    if (!value) {
      return res.status(404).json(responses.notFound('Lookup value'));
    }
    
    res.json(responses.ok(value));
  } catch (error) {
    console.error('Get lookup value error:', error);
    res.status(500).json(responses.internalError('Failed to fetch lookup value'));
  }
};

const createValue = async (req, res) => {
  try {
    const valueData = {
      ...req.body,
      created_by: req.user.id
    };
    
    const value = await LookupValue.create(valueData);
    res.status(201).json(responses.created(value));
  } catch (error) {
    console.error('Create lookup value error:', error);
    res.status(500).json(responses.internalError('Failed to create lookup value'));
  }
};

const updateValue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingValue = await LookupValue.findById(id);
    if (!existingValue) {
      return res.status(404).json(responses.notFound('Lookup value'));
    }
    
    const value = await LookupValue.update(id, req.body);
    res.json(responses.ok(value));
  } catch (error) {
    console.error('Update lookup value error:', error);
    res.status(500).json(responses.internalError('Failed to update lookup value'));
  }
};

const deleteValue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingValue = await LookupValue.findById(id);
    if (!existingValue) {
      return res.status(404).json(responses.notFound('Lookup value'));
    }
    
    await LookupValue.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete lookup value error:', error);
    res.status(500).json(responses.internalError('Failed to delete lookup value'));
  }
};

const getValuesByHeaders = async (req, res) => {
  try {
    const { header_ids, status = 'Active' } = req.body;
    
    // Get all lookup values for the specified header IDs
    const values = await LookupValue.findByMultipleHeaders(header_ids, status);
    
    // Group values by header_id
    const groupedValues = {};
    header_ids.forEach(headerId => {
      groupedValues[headerId] = values.filter(value => value.header_id === headerId);
    });
    
    res.json(responses.ok(groupedValues));
  } catch (error) {
    console.error('Get values by headers error:', error);
    res.status(500).json(responses.internalError('Failed to fetch lookup values by headers'));
  }
};

module.exports = {
  listHeaders,
  createHeader,
  updateHeader,
  deleteHeader,
  listValues,
  getValueById,
  createValue,
  updateValue,
  deleteValue,
  getValuesByHeaders
};
