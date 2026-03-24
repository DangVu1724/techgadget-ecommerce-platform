package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    boolean existsByAttributeName(String attributeName);

    List<Attribute> findByAttributeNameContainingIgnoreCase(String attributeName);
}
