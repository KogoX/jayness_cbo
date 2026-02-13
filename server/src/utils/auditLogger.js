const AuditLog = require('../models/AuditLog');

const sanitize = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return null;
  }
};

const getActor = (req, source = 'api') => {
  if (req?.user?._id) {
    return {
      actorId: req.user._id,
      actorRole: req.user.role || 'user',
      source,
    };
  }

  return {
    actorId: null,
    actorRole: source === 'system_job' ? 'system' : 'anonymous',
    source,
  };
};

const logAudit = async ({
  req = null,
  action,
  entityType,
  entityId = null,
  before = null,
  after = null,
  metadata = null,
  status = 'success',
  source = 'api',
} = {}) => {
  if (!action || !entityType) return null;

  const actor = getActor(req, source);
  const context = req?.requestContext || {};

  return AuditLog.create({
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    source: actor.source,
    status,
    requestId: context.requestId || null,
    ipAddress: context.ipAddress || null,
    userAgent: context.userAgent || null,
    before: sanitize(before),
    after: sanitize(after),
    metadata: sanitize(metadata),
  });
};

module.exports = { logAudit };
