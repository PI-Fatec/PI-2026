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


# Colunas SELECIONADAS P/ criação do modelo
FEATURES = [
    'HighBP','HighChol','BMI','Smoker','Stroke',
    'HeartDiseaseorAttack','PhysActivity','Fruits',
    'Veggies','HvyAlcoholConsump','DiffWalk','Sex','Age'
]


# 1 Coleta dos dados
def load_and_explore_data(filepath, sample_size=30000): # Limitado a 30k linhas p/ evitar lentidão e economizar espaço
    df = pd.read_csv(filepath)
    
    print(f"\nDataset original: {df.shape}")
    
    if df.shape[0] > sample_size:
        df = df.sample(n=sample_size, random_state=42)
        print(f"Usando amostra de {sample_size} linhas")
    
    print(f"Dataset usado: {df.shape}")
    
    return df


# 2 Limpeza e tratamento dos dados
def treat_data(df):
    df = df.drop_duplicates()
    df = df.fillna(df.median())
    return df


# 3 Pré-processamento dos dados
def preprocess_data(df, target_col='Diabetes_012'):
    
    X = df[FEATURES]
    y = (df[target_col] > 0).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler_class = StandardScaler()
    X_train_scaled = scaler_class.fit_transform(X_train)
    X_test_scaled = scaler_class.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler_class


# 4 Classificação (Supervisionado)
def train_supervised_models(X_train, X_test, y_train, y_test):
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("\nClassificação (Supervisionado):")
    print(classification_report(y_test, y_pred))
    print("ROC-AUC:", roc_auc_score(y_test, y_prob))
    
    return model


# 5 Clustering (Não supervisionado)
def train_unsupervised_model(df, target_col='Diabetes_012'):
    
    print("\n" + "="*80)
    print("Clustering (Não supervisionado)")
    print("="*80)
    
    X = df[FEATURES]
    y = (df[target_col] > 0).astype(int)
    
    scaler_cluster = StandardScaler()
    X_scaled = scaler_cluster.fit_transform(X)
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    sil = silhouette_score(X_scaled, clusters)
    db = davies_bouldin_score(X_scaled, clusters)
    
    print(f"\nSilhouette: {sil:.4f}")
    print(f"Davies-Bouldin: {db:.4f}")
    
    # Análise dos clusters
    df_analysis = X.copy()
    df_analysis['cluster'] = clusters
    df_analysis['risco'] = y
    
    print("\nMédia por cluster:\n")
    print(df_analysis.groupby('cluster').mean())
    
    risco_cluster = df_analysis.groupby('cluster')['risco'].mean()
    
    print("\nRisco médio por cluster:\n")
    print(risco_cluster)
    
    # Rotular clusters com base no risco médio
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


# 6 Main

def main():
    
    print("\nIniciando pipeline")
    
    df = load_and_explore_data("diabetes_012_health_indicators_BRFSS2015.csv")
    df = treat_data(df)
    
    X_train, X_test, y_train, y_test, scaler_class = preprocess_data(df)
    
    model_class = train_supervised_models(X_train, X_test, y_train, y_test)
    
    kmeans, scaler_cluster, cluster_labels = train_unsupervised_model(df)
    
    # Salvar modelos, scalers e labels dos clusters
    
    os.makedirs("models", exist_ok=True)
    
    pickle.dump(model_class, open("models/modelo_supervisionado.pkl", "wb"))
    pickle.dump(kmeans, open("models/modelo_clustering.pkl", "wb"))
    
    pickle.dump(scaler_class, open("models/scaler_classificacao.pkl", "wb"))
    pickle.dump(scaler_cluster, open("models/scaler_clustering.pkl", "wb"))
    
    pickle.dump(cluster_labels, open("models/cluster_labels.pkl", "wb"))
    
    pickle.dump(FEATURES, open("models/features.pkl", "wb"))
    
    print("\n Modelos salvos com sucesso")
    
    return model_class, kmeans


if __name__ == "__main__":
    main()