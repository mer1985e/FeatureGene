from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.linear_model import SGDClassifier
import random
import io

app = Flask(__name__)


# ---------- GA Core ----------
def create_random_chromosome(feature_count, true_ratio=0.3):
    pass


def initialize_population(pop_size, feature_count, true_ratio=0.7):
    pass


def evaluate_fitness(chromosome, X_train, X_test, y_train, y_test):
    pass


def crossover(p1, p2, rate):
    pass


def mutate(chromosome, rate):
    pass


def load_and_preprocess_csv(csv_content, target_column_idx, id_column_idx=None):
    pass

# ---------- Flask routes ----------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/run_ga", methods=["POST"])
def run_ga():
    """
    Main endpoint to run the Genetic Algorithm for feature selection.
    
    This function is already implemented for you. Study it to understand
    how all the GA components work together.
    """
    data = request.json
    pop_size = int(data.get("popSize", 30))
    crossover_rate = float(data.get("crossRate", 0.7))
    mutation_rate = float(data.get("mutRate", 0.1))
    max_gen = int(data.get("maxGen", 20))
    convergence_threshold = data.get("convergenceThreshold")
    if convergence_threshold is not None:
        convergence_threshold = float(data.get("convergenceThreshold"))
    csv_content = data.get("csvData", "")
    
    # Get user-specified column indices
    id_column_idx = data.get("idColumn")  # Can be None if no ID column
    target_column_idx = data.get("targetColumn")  # Required
    
    if target_column_idx is None:
        return jsonify({"error": "Target column must be specified"})

    # --- Load CSV ---
    result, error = load_and_preprocess_csv(csv_content, target_column_idx, id_column_idx)
    if error:
        return jsonify({"error": error})
    
    X_train, X_test, y_train, y_test, feature_headers, target_header, df = result
    feature_count = len(feature_headers)

    # --- Initialize ---
    population = initialize_population(pop_size, feature_count)
    best_fitness = 0
    best_chromosome = []
    history = []
    prev_best = 0
    converged = False

    # --- GA Loop ---
    for gen in range(max_gen):
        fitnesses = [evaluate_fitness(ch, X_train, X_test, y_train, y_test) for ch in population]
        gen_best = max(fitnesses)
        best_idx = fitnesses.index(gen_best)

        if gen_best > best_fitness:
            best_fitness = gen_best
            best_chromosome = population[best_idx][:]

        history.append(best_fitness)

        # Check convergence (skip first generation)
        if gen > 0 and prev_best > 0 and convergence_threshold is not None:
            improvement = abs(best_fitness - prev_best) 
            if improvement < convergence_threshold:
                converged = True
                break
        
        prev_best = best_fitness

        new_pop = []
        while len(new_pop) < pop_size:
            p1, p2 = random.sample(population, 2)
            c1, c2 = crossover(p1, p2, crossover_rate)
            new_pop.append(mutate(c1, mutation_rate))
            if len(new_pop) < pop_size:
                new_pop.append(mutate(c2, mutation_rate))
        population = new_pop

    selected_features = [f for f, g in zip(feature_headers, best_chromosome) if g == 1]
    
    # Prepare response
    response = {
        "bestFitness": round(best_fitness, 4),
        "bestChromosome": best_chromosome,
        "selectedFeatures": selected_features,
        "history": history,
        "featuresCount": feature_count,
        "rows": len(df),
        "target": target_header,
        "generations": len(history),
        "converged": converged
    }
    
    # Add ID column name if specified
    if id_column_idx is not None:
        response["idColumn"] = df.columns[id_column_idx]
    
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
