const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'driver', 'parent'] }
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;