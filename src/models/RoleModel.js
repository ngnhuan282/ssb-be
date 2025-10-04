const roleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, enum: ['admin', 'driver', 'parent'] }
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;