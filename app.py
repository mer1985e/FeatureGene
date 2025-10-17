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

def run_ga_feature_selection(
    X_train,
    X_test,
    y_train,
    y_test,
    feature_headers,
    pop_size,
    crossover_rate,
    mutation_rate,
    max_gen,
    convergence_threshold=None,
):
    """
    Execute GA feature selection and return core results.

    Returns dict with:
      - best_fitness, best_chromosome, history, converged, selected_features
    """
    feature_count = len(feature_headers)

    population = initialize_population(pop_size, feature_count)
    best_fitness = 0.0
    best_chromosome = []
    history = []
    prev_best = 0.0
    converged = False

    for gen in range(max_gen):
        fitnesses = [evaluate_fitness(ch, X_train, X_test, y_train, y_test) for ch in population]
        gen_best = max(fitnesses)
        best_idx = fitnesses.index(gen_best)

        if gen_best > best_fitness:
            best_fitness = gen_best
            best_chromosome = population[best_idx][:]

        history.append(best_fitness)

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
    return {
        "best_fitness": float(best_fitness),
        "best_chromosome": best_chromosome,
        "history": history,
        "converged": bool(converged),
        "selected_features": selected_features,
    }

def run_variance_threshold_selection(
    X_train,
    X_test,
    y_train,
    y_test,
    feature_headers,
    threshold: float,
):
    """
    Execute VarianceThreshold selection and evaluate a classifier on selected features.

    Returns dict with:
      - threshold, accuracy, selected_features, removed_features
    """
    try:
        selector = VarianceThreshold(threshold=threshold)
        selector.fit(X_train)
        mask = selector.get_support(indices=True)
        selected_features = [feature_headers[i] for i in mask]
        removed_features = [f for i, f in enumerate(feature_headers) if i not in set(mask)]

        if len(mask) == 0:
            accuracy = 0.0
        else:
            X_train_sel = selector.transform(X_train)
            X_test_sel = selector.transform(X_test)
            model = SGDClassifier(
                loss="log_loss",
                max_iter=200,
                tol=1e-3,
                n_jobs=-1,
                random_state=42,
            )
            model.fit(X_train_sel, y_train)
            accuracy = float(model.score(X_test_sel, y_test))
    except Exception:
        selected_features = []
        removed_features = list(feature_headers)
        accuracy = 0.0
    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy),
        "selected_features": selected_features,
        "removed_features": removed_features,
    }

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

    ga = run_ga_feature_selection(
        X_train,
        X_test,
        y_train,
        y_test,
        feature_headers,
        pop_size,
        crossover_rate,
        mutation_rate,
        max_gen,
        convergence_threshold,
    )
    
    # Prepare response
    response = {
        "bestFitness": round(ga["best_fitness"], 4),
        "bestChromosome": ga["best_chromosome"],
        "selectedFeatures": ga["selected_features"],
        "history": ga["history"],
        "featuresCount": feature_count,
        "rows": len(df),
        "target": target_header,
        "generations": len(ga["history"]),
        "converged": ga["converged"]
    }
    
    # Add ID column name if specified
    if id_column_idx is not None:
        response["idColumn"] = df.columns[id_column_idx]
    
    return jsonify(response)

@app.route("/run_variance_threshold", methods=["POST"])
def run_variance_threshold():
    data = request.json
    threshold = float(data.get("threshold", 0.0))
    csv_content = data.get("csvData", "")
    id_column_idx = data.get("idColumn")
    target_column_idx = data.get("targetColumn")

    if target_column_idx is None:
        return jsonify({"error": "Target column must be specified"})

    result, error = load_and_preprocess_csv(csv_content, target_column_idx, id_column_idx)
    if error:
        return jsonify({"error": error})

    X_train, X_test, y_train, y_test, feature_headers, target_header, df = result

    start_exec = time.perf_counter()
    vt = run_variance_threshold_selection(
        X_train,
        X_test,
        y_train,
        y_test,
        feature_headers,
        threshold,
    )
    exec_time = time.perf_counter() - start_exec

    response = {
        "thresholdUsed": vt["threshold"],
        "accuracy": round(vt["accuracy"], 4),
        "selectedFeatures": vt["selected_features"],
        "removedFeatures": vt["removed_features"],
        "numFeaturesSelected": len(vt["selected_features"]),
        "numFeaturesTotal": len(feature_headers),
        "rows": len(df),
        "target": target_header,
        "execTimeSeconds": round(exec_time, 4),
    }
    if id_column_idx is not None:
        response["idColumn"] = df.columns[id_column_idx]

    return jsonify(response)

@app.route("/run_comparison", methods=["POST"])
def run_comparison():
    data = request.json
    pop_size = int(data.get("popSize", 30))
    crossover_rate = float(data.get("crossRate", 0.7))
    mutation_rate = float(data.get("mutRate", 0.1))
    max_gen = int(data.get("maxGen", 20))
    convergence_threshold = data.get("convergenceThreshold")
    if convergence_threshold is not None:
        convergence_threshold = float(convergence_threshold)
    vt_threshold = float(data.get("vtThreshold", 0.0))
    csv_content = data.get("csvData", "")
    id_column_idx = data.get("idColumn")
    target_column_idx = data.get("targetColumn")

    if target_column_idx is None:
        return jsonify({"error": "Target column must be specified"})

    result, error = load_and_preprocess_csv(csv_content, target_column_idx, id_column_idx)
    if error:
        return jsonify({"error": error})

    X_train, X_test, y_train, y_test, feature_headers, target_header, df = result
    feature_count = len(feature_headers)

    ga_start = time.perf_counter()
    ga = run_ga_feature_selection(
        X_train,
        X_test,
        y_train,
        y_test,
        feature_headers,
        pop_size,
        crossover_rate,
        mutation_rate,
        max_gen,
        convergence_threshold,
    )
    ga_exec = time.perf_counter() - ga_start

    vt_start = time.perf_counter()
    vt = run_variance_threshold_selection(
        X_train,
        X_test,
        y_train,
        y_test,
        feature_headers,
        vt_threshold,
    )
    vt_exec = time.perf_counter() - vt_start

    response = {
        "dataset": {
            "target": target_header,
            "numFeaturesTotal": feature_count,
            "rows": len(df),
        },
        "ga": {
            "bestFitness": round(ga["best_fitness"], 4),
            "history": ga["history"],
            "selectedFeatures": ga["selected_features"],
            "numFeaturesSelected": len(ga["selected_features"]),
            "generations": len(ga["history"]),
            "converged": ga["converged"],
            "accuracy": round(ga["best_fitness"], 4),
            "execTimeSeconds": round(ga_exec, 4),
        },
        "varianceThreshold": {
            "thresholdUsed": vt["threshold"],
            "accuracy": round(vt["accuracy"], 4),
            "selectedFeatures": vt["selected_features"],
            "removedFeatures": vt["removed_features"],
            "numFeaturesSelected": len(vt["selected_features"]),
            "execTimeSeconds": round(vt_exec, 4),
        },
    }
    if id_column_idx is not None:
        response["dataset"]["idColumn"] = df.columns[id_column_idx]

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
