import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import CheckoutTable from '../../components/customers/CheckoutTable';
import NavBar from '../../components/Navbar';
import {
  DivBodyCheckout,
  MainChekoutDiv,
  TotalDiv,
  AddressDiv,
} from '../../styles/tablestyles/Checkout';

import { apiCreateOrder, apiGetSellers } from '../../services/apiCalls';
import { changeSubtotalList } from '../../redux/slice/productCart';

export default function Checkout() {
  const dispatch = useDispatch();

  const productsSold = useSelector(({ productCartReducer }) => (
    productCartReducer.subtotalCartList)).filter((product) => product.subtotal > 0);
  
  const totalPrice = useSelector(({ productCartReducer }) => (
    productCartReducer.totalPrice));

  const [redirect, setRedirect] = useState(false);
  const [orderId, setIdOrder] = useState('');
  const [sellers, setSellers] = useState([]);
  const [order, setOrder] = useState({
    sellerId: 2,
    totalPrice,
    deliveryAddress: '',
    deliveryNumber: '',
    status: 'Pendente',
  });

  useEffect(() => {
    const apiCall = async () => {
      const response = await apiGetSellers();
      if (response.error) {
        console.log(response.error);
      } else {
        setSellers(response);
      }
    };
    apiCall();
  }, []);

  const handleChange = ({ name, value }) => {
    if (name === 'select-seller') setOrder({ ...order, sellerId: value });
    if (name === 'customer-address') setOrder({ ...order, deliveryAddress: value });
    if (name === 'customer-address-number') {
      setOrder({ ...order, deliveryNumber: value });
    }
  };

  const sendOrder = async () => {
    const orderDispatched = await apiCreateOrder({
      ...order,
      productsSold: productsSold.map(({ id: productId, quantity }) => ({ productId, quantity })),
    });
    setIdOrder(orderDispatched.id);
    setRedirect(true);
    productsSold.forEach(productSold => {
      dispatch(changeSubtotalList({ ...productSold, subtotal: 0, quantity: 0 }))
    });
  };

  return (
    <DivBodyCheckout>
      { redirect ? <Redirect to={ `/customer/orders/${orderId}` } /> : null }
      <NavBar />
      <MainChekoutDiv>
        <legend>Finalizar pedido</legend>
        <CheckoutTable productsSold={ productsSold }/>
          <TotalDiv
            data-testid="customer_checkout__element-order-total-price"
            >
           { `Total: R$ ${totalPrice.toFixed(2).toString().replace('.', ',')}`}
          </TotalDiv>
        <AddressDiv>
          <h2>Detalhes para entrega</h2>
          <div>
            <div>
              <p>Vendedor(a)</p>
              <select
                name="select-seller"
                onChange={ (e) => handleChange(e.target) }
                disabled={productsSold.length === 0}
                data-testid="customer_checkout__select-seller"
              >
                {
                  sellers.map(({ id, name }, index) => (
                    <option key={ index } value={ id }>
                      {name}
                    </option>))
                }
              </select>
            </div>
            <div>
              <p>Endereço</p>
              <input
                name="customer-address"
                type="text"
                value={ order.deliveryAddress }
                onChange={ (e) => handleChange(e.target) }
                disabled={productsSold.length === 0}
                data-testid="customer_checkout__input-address"
              />
            </div>
            <div>
              <p>Número residencial</p>
              <input
                name="customer-address-number"
                type="number"
                value={ order.deliveryNumber }
                onChange={ (e) => handleChange(e.target) }
                disabled={productsSold.length === 0}
                data-testid="customer_checkout__input-addressNumber"
                />
            </div>
            <button
              type="button"
              onClick={ () => sendOrder() }
              disabled={Object.values(order).some((value) => !value) || productsSold.length === 0}
              data-testid="customer_checkout__button-submit-order"
              >
              Finalizar
            </button>
          </div>
        </AddressDiv>
      </MainChekoutDiv>
    </DivBodyCheckout>
  );
}
