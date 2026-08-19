"""Binary seizure classification: y==1 (seizure) vs y in 2..5 (else).
Imbalanced (~1:4). Trains RandomForest + XGBoost (ML) then MLP (NN),
saves confusion-matrix-based metrics to code/results/metrics.json.
"""
import json
from pathlib import Path

import joblib
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.utils import resample

DATA_PATH = Path(__file__).parent.parent / "data" / "Epileptic Seizure Recognition.csv"
RESULTS_PATH = Path(__file__).parent / "results" / "metrics.json"


def load_data():
    df = pd.read_csv(DATA_PATH).drop(columns=["Unnamed"])
    X = df.drop(columns=["y"]).values
    y = (df["y"] == 1).astype(int).values  # 1 stays 1, 2-5 -> 0
    return X, y


def evaluate(name, y_true, y_pred, y_proba):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return {
        "model": name,
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "roc_auc": roc_auc_score(y_true, y_proba),
    }


def main():
    X, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

    results = []

    rf = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    results.append(evaluate("RandomForest", y_test, rf.predict(X_test), rf.predict_proba(X_test)[:, 1]))


    RESULTS_PATH.parent.mkdir(exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(results, indent=2))

    for r in results:
        print(f"\n{r['model']}")
        print(f"  TP={r['tp']} TN={r['tn']} FP={r['fp']} FN={r['fn']}")
        print(f"  accuracy={r['accuracy']:.4f} precision={r['precision']:.4f} "
              f"recall={r['recall']:.4f} f1={r['f1']:.4f} roc_auc={r['roc_auc']:.4f}")
    print(f"\nsaved -> {RESULTS_PATH}")


    os.makedirs("results", exist_ok=True)
    joblib.dump(rf, "results/rf_model.pkl")


if __name__ == "__main__":
    main()
