package com.jrfos.repository;

import com.jrfos.entity.Subject;
import com.jrfos.enums.PaperType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Subject entity operations.
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * Finds all subjects for a specific paper type, ordered by display order.
     *
     * @param paperType the paper type to filter by
     * @return list of subjects ordered by displayOrder
     */
    List<Subject> findByPaperTypeOrderByDisplayOrder(PaperType paperType);

    /**
     * Finds all subjects ordered by display order.
     *
     * @return list of all subjects ordered by displayOrder
     */
    List<Subject> findAllByOrderByDisplayOrder();
}
