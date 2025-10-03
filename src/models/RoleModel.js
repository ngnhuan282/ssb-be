const roleSchema = new mongoose.Schema({
  idrole: { type: String, required: true },
  nameRole: { type: String, required: true, enum: ['admin', 'driver', 'parent'] }
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;