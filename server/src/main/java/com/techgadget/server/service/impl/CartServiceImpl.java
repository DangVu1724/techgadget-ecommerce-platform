package com.techgadget.server.service.impl;

import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.exception.UnauthorizedException;
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

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final VariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponseDTO getCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findCartWithItems(user.getId()).orElseGet(() -> createCart(user));
        return mapToDTO(cart);
    }

    @Override
    public void addToCart(String email, CartItemRequestDTO request) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findCartWithItems(user.getId()).orElseGet(() -> createCart(user));
        ProductVariant variant = getVariantById(request.getVariantId());

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId()).orElse(null);
        if (item != null) {
            int newQuantity = item.getQuantity() + request.getQuantity();
            validateStock(newQuantity, variant);
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
            return;
        }

        validateStock(request.getQuantity(), variant);

        CartItem newItem = new CartItem();
        newItem.setCart(cart);
        newItem.setVariant(variant);
        newItem.setQuantity(request.getQuantity());
        cartItemRepository.save(newItem);
    }

    @Override
    public void removeFromCart(String email, Long cartItemId) {
        User user = getUserByEmail(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not allowed to modify this cart item.");
        }

        cartItemRepository.delete(item);
    }

    @Override
    public void updateQuantity(String email, CartItemRequestDTO request) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findCartWithItems(user.getId())
                .orElseThrow(() -> new NotFoundException("Cart not found for user id: " + user.getId()));
        ProductVariant variant = getVariantById(request.getVariantId());

        CartItem cartItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElseThrow(() -> new NotFoundException("Cart item not found for variant id: " + request.getVariantId()));

        if (request.getQuantity() == 0) {
            cartItemRepository.delete(cartItem);
            return;
        }

        validateStock(request.getQuantity(), variant);
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }

    private ProductVariant getVariantById(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found with id: " + variantId));
    }

    private void validateStock(int quantity, ProductVariant variant) {
        int available = variant.getStock() - variant.getReservedStock();
        if (quantity > available) {
            throw new BadRequestException("Requested quantity exceeds available stock.");
        }
    }

    private Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private CartResponseDTO mapToDTO(Cart cart) {
        CartResponseDTO dto = new CartResponseDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());

        List<CartItemResponseDTO> items = cart.getItems().stream().map(item -> {
            CartItemResponseDTO response = new CartItemResponseDTO();
            response.setId(item.getId());
            response.setVariantId(item.getVariant().getId());
            response.setQuantity(item.getQuantity());
            response.setProductName(item.getVariant().getProduct().getName());
            response.setPrice(item.getVariant().getPrice());
            return response;
        }).toList();

        dto.setItems(items);
        dto.setTotalPrice(items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return dto;
    }
}
