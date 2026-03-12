package com.techgadget.server.service.impl;

import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartItemResponseDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;
import com.techgadget.server.model.entity.Cart;
import com.techgadget.server.model.entity.CartItem;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.CartItemRepository;
import com.techgadget.server.repository.CartRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.repository.VariantRepository;
import com.techgadget.server.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final VariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponseDTO getCart(Long userId) {
        Cart cart = cartRepository.findCartWithItems(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
        return mapToDTO(cart) ;
    }

    @Override
    public void addToCart(Long userId, CartItemRequestDTO request) {
        Cart cart =  cartRepository.findCartWithItems(userId).orElseGet(()-> createCart(userId));

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        CartItem item = cartItemRepository
                .findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElse(null);

        if (item != null) {
            int newQuantity = item.getQuantity() + request.getQuantity();
            if(newQuantity > variant.getStock()){
                throw new RuntimeException("Quantity exceeded stock");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }

    }

    @Override
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);

    }

    @Override
    public void updateQuantity(Long userId, CartItemRequestDTO request) {
        Cart cart = cartRepository.findCartWithItems(userId).orElseThrow(() -> new RuntimeException("Cart not found"));

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));


        CartItem cartItem = cartItemRepository
                .findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if(request.getQuantity() > variant.getStock()) throw new RuntimeException("Quantity exceeds stock");

        if(request.getQuantity() == 0){
            cartItemRepository.delete(cartItem);
            return;
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

    }



    private Cart createCart(Long userId) {
        User user= userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private CartResponseDTO mapToDTO(Cart cart) {

        CartResponseDTO dto = new CartResponseDTO();

        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        List<CartItemResponseDTO> items = cart.getItems().stream().map(item-> {
            CartItemResponseDTO cartItemResponseDTO = new CartItemResponseDTO();

            cartItemResponseDTO.setId(item.getId());
            cartItemResponseDTO.setVariantId(item.getVariant().getId());
            cartItemResponseDTO.setQuantity(item.getQuantity());
            cartItemResponseDTO.setProductName(item.getVariant().getProduct().getName());
            cartItemResponseDTO.setPrice(item.getVariant().getPrice());

            return cartItemResponseDTO;
        }).toList();

        dto.setItems(items);

        return dto;
    }
}
