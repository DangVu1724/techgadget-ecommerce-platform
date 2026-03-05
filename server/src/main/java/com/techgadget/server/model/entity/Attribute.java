package com.techgadget.server.model.entity;

import com.techgadget.server.model.enums.AttributeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "attributes")
@Getter @Setter
public class Attribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attributeId;

    @Column(nullable = false, unique = true)
    private String attributeName;

    @Enumerated(EnumType.STRING)
    private AttributeType dataType;

}
