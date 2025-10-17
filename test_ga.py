import unittest
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from app import (
    create_random_chromosome,
    initialize_population,
    evaluate_fitness,
    crossover,
    mutate
)


class TestGeneticAlgorithmFunctions(unittest.TestCase):
    """Simple test suite for genetic algorithm functions - one test per function"""
    
    def setUp(self):
        """Set up test fixtures before each test method"""
        # Create a simple dataset for fitness evaluation
        X, y = make_classification(
            n_samples=100,
            n_features=10,
            n_informative=5,
            n_redundant=2,
            random_state=42
        )
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        self.feature_count = 10
    
    def test_create_random_chromosome(self):
        """Test that create_random_chromosome works correctly"""
        chromosome = create_random_chromosome(self.feature_count, true_ratio=0.3)
        
        # Check length
        self.assertEqual(len(chromosome), self.feature_count)
        
        # Check binary values
        self.assertTrue(all(gene in [0, 1] for gene in chromosome))
        
        # Check ratio
        expected_ones = int(self.feature_count * 0.3)
        self.assertEqual(sum(chromosome), expected_ones)
    
    def test_initialize_population(self):
        """Test that initialize_population works correctly"""
        pop_size = 20
        population = initialize_population(pop_size, self.feature_count, true_ratio=0.5)
        
        # Check population size
        self.assertEqual(len(population), pop_size)
        
        # Check all chromosomes have correct length
        for chromosome in population:
            self.assertEqual(len(chromosome), self.feature_count)
            
        # Check all chromosomes are binary
        for chromosome in population:
            self.assertTrue(all(gene in [0, 1] for gene in chromosome))
    
    def test_evaluate_fitness(self):
        """Test that evaluate_fitness works correctly"""
        chromosome = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
        fitness = evaluate_fitness(
            chromosome, self.X_train, self.X_test, self.y_train, self.y_test
        )
        
        # Check fitness is a float between 0 and 1
        self.assertIsInstance(fitness, float)
        self.assertGreaterEqual(fitness, 0.0)
        self.assertLessEqual(fitness, 1.0)
        
        # Check no features returns 0
        chromosome_empty = [0] * self.feature_count
        fitness_empty = evaluate_fitness(
            chromosome_empty, self.X_train, self.X_test, self.y_train, self.y_test
        )
        self.assertEqual(fitness_empty, 0.0)
    
    def test_crossover(self):
        """Test that crossover works correctly"""
        p1 = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
        p2 = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
        
        # Test with rate=1.0 (always crossover)
        c1, c2 = crossover(p1, p2, rate=1.0)
        
        # Check length preserved
        self.assertEqual(len(c1), len(p1))
        self.assertEqual(len(c2), len(p2))
        
        # Check binary values preserved
        self.assertTrue(all(gene in [0, 1] for gene in c1))
        self.assertTrue(all(gene in [0, 1] for gene in c2))
        
        # Test with rate=0.0 (no crossover)
        c1, c2 = crossover(p1, p2, rate=0.0)
        self.assertEqual(c1, p1)
        self.assertEqual(c2, p2)
    
    def test_mutate(self):
        """Test that mutate works correctly"""
        chromosome = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
        
        # Test with rate=0.0 (no mutation)
        mutated = mutate(chromosome, rate=0.0)
        self.assertEqual(mutated, chromosome)
        
        # Test with rate=1.0 (flip all)
        mutated = mutate(chromosome, rate=1.0)
        expected = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
        self.assertEqual(mutated, expected)
        
        # Test that mutation preserves length and binary values
        mutated = mutate(chromosome, rate=0.5)
        self.assertEqual(len(mutated), len(chromosome))
        self.assertTrue(all(gene in [0, 1] for gene in mutated))


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
