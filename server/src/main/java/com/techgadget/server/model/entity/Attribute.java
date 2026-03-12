package com.techgadget.server.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.techgadget.server.model.enums.AttributeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "attributes")
@Getter
@Setter
public class Attribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attributeId;

    @Column(nullable = false, unique = true)
    private String attributeName;

    @Enumerated(EnumType.STRING)
    private AttributeType dataType;

    @ManyToMany(mappedBy = "attributes")
    @JsonIgnore
    private Set<Category> categories = new HashSet<>();
}
