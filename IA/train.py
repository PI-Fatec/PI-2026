import pandas as pd
import numpy as np
from datetime import datetime
import warnings
import pickle
import os

warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (classification_report, roc_auc_score)

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score


# ==================================================================================
# 🔥 FEATURES SELECIONADAS
# ==================================================================================

FEATURES = [
    'HighBP','HighChol','BMI','Smoker','Stroke',
    'HeartDiseaseorAttack','PhysActivity','Fruits',
    'Veggies','HvyAlcoholConsump','DiffWalk','Sex','Age'
]


# ==================================================================================
# 1. COLETA
# ==================================================================================

def load_and_explore_data(filepath, sample_size=30000):
    df = pd.read_csv(filepath)
    
    print(f"\n📊 Dataset original: {df.shape}")
    
    if df.shape[0] > sample_size:
        df = df.sample(n=sample_size, random_state=42)
        print(f"🔍 Usando amostra de {sample_size} linhas")
    
    print(f"📊 Dataset usado: {df.shape}")
    
    return df


# ==================================================================================
# 2. LIMPEZA
# ==================================================================================

def treat_data(df):
    df = df.drop_duplicates()
    df = df.fillna(df.median())
    return df


# ==================================================================================
# 3. PRÉ-PROCESSAMENTO
# ==================================================================================

def preprocess_data(df, target_col='Diabetes_012'):
    
    X = df[FEATURES]  # 🔥 ALTERADO AQUI
    y = (df[target_col] > 0).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler_class = StandardScaler()
    X_train_scaled = scaler_class.fit_transform(X_train)
    X_test_scaled = scaler_class.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler_class


# ==================================================================================
# 4. CLASSIFICAÇÃO
# ==================================================================================

def train_supervised_models(X_train, X_test, y_train, y_test):
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("\n📊 CLASSIFICAÇÃO:")
    print(classification_report(y_test, y_pred))
    print("ROC-AUC:", roc_auc_score(y_test, y_prob))
    
    return model


# ==================================================================================
# 5. CLUSTERING
# ==================================================================================

def train_unsupervised_model(df, target_col='Diabetes_012'):
    
    print("\n" + "="*80)
    print("CLUSTERING")
    print("="*80)
    
    X = df[FEATURES]  # 🔥 ALTERADO AQUI
    y = (df[target_col] > 0).astype(int)
    
    scaler_cluster = StandardScaler()
    X_scaled = scaler_cluster.fit_transform(X)
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    sil = silhouette_score(X_scaled, clusters)
    db = davies_bouldin_score(X_scaled, clusters)
    
    print(f"\nSilhouette: {sil:.4f}")
    print(f"Davies-Bouldin: {db:.4f}")
    
    # 🔥 ANÁLISE DOS CLUSTERS
    df_analysis = X.copy()
    df_analysis['cluster'] = clusters
    df_analysis['risco'] = y
    
    print("\n📊 MÉDIA POR CLUSTER:\n")
    print(df_analysis.groupby('cluster').mean())
    
    risco_cluster = df_analysis.groupby('cluster')['risco'].mean()
    
    print("\n🔥 RISCO MÉDIO POR CLUSTER:\n")
    print(risco_cluster)
    
    # 🔥 ROTULAR CLUSTERS
    sorted_clusters = risco_cluster.sort_values()
    
    cluster_labels = {}
    
    for i, (cluster_id, risco_val) in enumerate(sorted_clusters.items()):
        if i == 0:
            label = "Baixo Risco"
        elif i == len(sorted_clusters) - 1:
            label = "Alto Risco"
        else:
            label = "Médio Risco"
        
        cluster_labels[cluster_id] = label
        print(f"Cluster {cluster_id}: {label} ({risco_val:.2f})")
    
    return kmeans, scaler_cluster, cluster_labels


# ==================================================================================
# 6. MAIN
# ==================================================================================

def main():
    
    print("\n🚀 INICIANDO PIPELINE")
    
    df = load_and_explore_data("diabetes_012_health_indicators_BRFSS2015.csv")
    df = treat_data(df)
    
    X_train, X_test, y_train, y_test, scaler_class = preprocess_data(df)
    
    model_class = train_supervised_models(X_train, X_test, y_train, y_test)
    
    kmeans, scaler_cluster, cluster_labels = train_unsupervised_model(df)
    
    # ==================================================================================
    # SALVAR
    # ==================================================================================
    
    os.makedirs("models", exist_ok=True)
    
    pickle.dump(model_class, open("models/modelo_supervisionado.pkl", "wb"))
    pickle.dump(kmeans, open("models/modelo_clustering.pkl", "wb"))
    
    pickle.dump(scaler_class, open("models/scaler_classificacao.pkl", "wb"))
    pickle.dump(scaler_cluster, open("models/scaler_clustering.pkl", "wb"))
    
    pickle.dump(cluster_labels, open("models/cluster_labels.pkl", "wb"))
    
    # 🔥 SALVAR FEATURES (IMPORTANTE)
    pickle.dump(FEATURES, open("models/features.pkl", "wb"))
    
    print("\n✅ MODELOS SALVOS COM SUCESSO")
    
    return model_class, kmeans


if __name__ == "__main__":
    main()