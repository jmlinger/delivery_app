const Models = require('../database/models');

module.exports = (io) => io.on('connection', (socket) => {
  socket.on('changeStatus', async ({ userId, orderId, status }) => {
    await Models.sales.update({ status }, { where: { id: orderId } });
    const updatedOrder = await Models.sales.findByPk(orderId);

    io.emit('updatedStatus', { status: updatedOrder.status });

    const getUserById = await Models.users.findByPk(userId);

    if (getUserById.role === 'customer') {
      const updatedOrders = await Models.sales.findAll({ where: { userId } });
      io.emit('updatedOrders', updatedOrders);
    }

    if (getUserById.role === 'seller') {
      const updatedOrders = await Models.sales.findAll({ where: { sellerId: userId } });
      io.emit('updatedOrders', updatedOrders);
    }
  });
});
