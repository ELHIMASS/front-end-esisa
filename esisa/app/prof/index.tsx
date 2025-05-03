import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { DataTable } from "react-native-paper";

interface Student {
  _id: string;
  name: string;
  grades: Array<{
    subject: string;
    cc?: number;
    partiel?: number;
    projet?: number;
  }>;
  absences: number;
}

const styles = StyleSheet.create({
  contentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  tableContainer: { marginTop: 10 },
  tableHeader: { backgroundColor: '#f5f5f5' },
  tableHeaderCell: { padding: 10 },
  headerSortable: { flexDirection: 'row', alignItems: 'center' },
  tableHeaderText: { fontWeight: 'bold' },
  tableRow: { borderBottomWidth: 1, borderColor: '#ddd' },
  tableCell: { padding: 8 },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyStateText: { fontSize: 16, marginTop: 10 },
  emptyStateSubtext: { fontSize: 14, color: '#666' }
});

const NotesTab: React.FC<{
  currentTab: string;
  selectedSubject: string;
  filteredStudents: Student[];
  sortColumn: string;
  sortOrder: 'asc' | 'desc';
  toggleSort: (column: string) => void;
  calculateAverage: (student: Student, subject: string) => number;
  getStudentStatus: (average: number) => { color: string; text: string };
  handleEditGrades: (studentId: string) => void;
}> = ({
  currentTab,
  selectedSubject,
  filteredStudents,
  sortColumn,
  sortOrder,
  toggleSort,
  calculateAverage,
  getStudentStatus,
  handleEditGrades
}) => {
  return (
    <>
      {currentTab === 'notes' && (
  <View>
    <Text style={styles.contentTitle}>GESTION DES NOTES: {selectedSubject}</Text>

    {filteredStudents.length > 0 ? (
      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <TouchableOpacity 
              style={[styles.tableHeaderCell, { flex: 2 }]}
              onPress={() => toggleSort('name')}
            >
              <View style={styles.headerSortable}>
                <Text style={styles.tableHeaderText}>Étudiant</Text>
                {sortColumn === 'name' && (
                  <Icon 
                    name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                    size={16} 
                    color="#FFD700" 
                  />
                )}
              </View>
            </TouchableOpacity>
            <DataTable.Title style={styles.tableHeaderCell}><Text style={styles.tableHeaderText}>CC</Text></DataTable.Title>
            <DataTable.Title style={styles.tableHeaderCell}><Text style={styles.tableHeaderText}>Partiel</Text></DataTable.Title>
            <DataTable.Title style={styles.tableHeaderCell}><Text style={styles.tableHeaderText}>Projet</Text></DataTable.Title>
            <TouchableOpacity style={styles.tableHeaderCell} onPress={() => toggleSort('average')}>
              <View style={styles.headerSortable}>
                <Text style={styles.tableHeaderText}>Moyenne</Text>
                {sortColumn === 'average' && (
                  <Icon 
                    name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                    size={16} 
                    color="#FFD700" 
                  />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tableHeaderCell} onPress={() => toggleSort('absences')}>
              <View style={styles.headerSortable}>
                <Text style={styles.tableHeaderText}>Absences</Text>
                {sortColumn === 'absences' && (
                  <Icon 
                    name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                    size={16} 
                    color="#FFD700" 
                  />
                )}
              </View>
            </TouchableOpacity>
            <DataTable.Title style={styles.tableHeaderCell}><Text style={styles.tableHeaderText}>Statut</Text></DataTable.Title>
            <DataTable.Title style={styles.tableHeaderCell}><Text style={styles.tableHeaderText}>Action</Text></DataTable.Title>
          </DataTable.Header>

          {filteredStudents.map((student) => {
            const subjectGrade = student.grades.find(grade => grade.subject === selectedSubject);
            const average = calculateAverage(student, selectedSubject);
            const status = getStudentStatus(average);

            return (
              <DataTable.Row key={student._id} style={styles.tableRow}>
                <DataTable.Cell style={[styles.tableCell, { flex: 2 }]}>{student.name}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>{subjectGrade?.cc ?? 'N/A'}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>{subjectGrade?.partiel ?? 'N/A'}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>{subjectGrade?.projet ?? 'N/A'}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>{average}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>{student.absences}</DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  <Text style={{ color: status.color, fontWeight: 'bold', fontSize: 12 }}>{status.text}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  <TouchableOpacity onPress={() => handleEditGrades(student._id)}>
                    <Icon name="edit" size={18} color="#FFD700" />
                  </TouchableOpacity>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable>
      </View>
    ) : (
      <View style={styles.emptyState}>
        <Icon name="search-off" size={60} color="#6D8EB4" />
        <Text style={styles.emptyStateText}>Aucun étudiant trouvé</Text>
        <Text style={styles.emptyStateSubtext}>Vérifiez les filtres ou la recherche</Text>
      </View>
    )}
  </View>
)}

// ...
    </>
  );
}
